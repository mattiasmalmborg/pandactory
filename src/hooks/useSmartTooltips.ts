import { useEffect } from 'react';

/**
 * Hook that shows tooltips positioned from element toward screen center
 * Supports live updating of tooltip content while hovering
 */
export function useSmartTooltips() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .tooltip-container {
        position: fixed;
        z-index: 99999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      .tooltip-container.visible {
        opacity: 1;
      }

      .tooltip-box {
        padding: 10px 14px;
        background: linear-gradient(135deg, rgba(31, 41, 55, 0.98), rgba(17, 24, 39, 0.98));
        backdrop-filter: blur(8px);
        color: #f5f5f5;
        font-size: 0.875rem;
        line-height: 1.4;
        border-radius: 6px;
        white-space: pre-wrap;
        max-width: 260px;
        border: 1px solid rgba(55, 65, 81, 0.5);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      }

      .tooltip-box .tooltip-number {
        font-variant-numeric: tabular-nums;
      }
    `;
    document.head.appendChild(style);

    let tooltipElement: HTMLDivElement | null = null;
    let currentTarget: HTMLElement | null = null;
    let attributeObserver: MutationObserver | null = null;

    const updateTooltipContent = () => {
      if (!currentTarget || !tooltipElement) return;

      const text = currentTarget.getAttribute('data-tooltip');
      if (!text) return;

      const box = tooltipElement.firstElementChild as HTMLDivElement;
      box.textContent = text;
    };

    const hideTooltip = () => {
      if (tooltipElement) {
        tooltipElement.classList.remove('visible');
      }
      // Stop observing attribute changes when tooltip is hidden
      if (attributeObserver) {
        attributeObserver.disconnect();
      }
      currentTarget = null;
    };

    const showTooltip = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      const text = target.getAttribute('data-tooltip');

      if (!text) return;

      currentTarget = target;

      // Create tooltip if it doesn't exist
      if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'tooltip-container';
        const tooltipBox = document.createElement('div');
        tooltipBox.className = 'tooltip-box';
        tooltipElement.appendChild(tooltipBox);
        document.body.appendChild(tooltipElement);
      }

      const box = tooltipElement.firstElementChild as HTMLDivElement;
      box.textContent = text;

      // Get element position
      const rect = target.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2;

      // Always position horizontally in screen center
      const screenCenterX = window.innerWidth / 2;

      // Position vertically near the element
      tooltipElement.style.left = `${screenCenterX}px`;
      tooltipElement.style.top = `${elementCenterY}px`;
      tooltipElement.style.transform = `translate(-50%, -50%)`;

      // Start observing attribute changes on the target for live updates
      if (attributeObserver) {
        attributeObserver.disconnect();
      }
      attributeObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-tooltip') {
            updateTooltipContent();
          }
        }
      });
      attributeObserver.observe(target, { attributes: true, attributeFilter: ['data-tooltip'] });

      // Show tooltip
      setTimeout(() => {
        tooltipElement?.classList.add('visible');
      }, 10);
    };

    // Attach event listeners to all tooltip elements
    const updateTooltips = () => {
      // If current target is no longer in the DOM, hide the tooltip
      if (currentTarget && !document.body.contains(currentTarget)) {
        hideTooltip();
      }

      document.querySelectorAll('[data-tooltip]').forEach(el => {
        el.removeEventListener('mouseenter', showTooltip as EventListener);
        el.removeEventListener('mouseleave', hideTooltip);
        el.addEventListener('mouseenter', showTooltip as EventListener);
        el.addEventListener('mouseleave', hideTooltip);
      });
    };

    updateTooltips();

    // Re-attach when DOM changes - also hide tooltip if element was removed
    const observer = new MutationObserver((mutations) => {
      // Check if any removed nodes contained our current target
      for (const mutation of mutations) {
        if (mutation.removedNodes.length > 0 && currentTarget) {
          for (const node of mutation.removedNodes) {
            if (node === currentTarget || (node instanceof Element && node.contains(currentTarget))) {
              hideTooltip();
              break;
            }
          }
        }
      }
      updateTooltips();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also hide tooltip on scroll (in case element scrolls out of view)
    const handleScroll = () => {
      if (currentTarget) {
        hideTooltip();
      }
    };

    // Use capture phase to catch scroll events on all elements
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      observer.disconnect();
      if (attributeObserver) {
        attributeObserver.disconnect();
      }
      document.removeEventListener('scroll', handleScroll, true);
      if (tooltipElement) {
        tooltipElement.remove();
      }
      style.remove();
    };
  }, []);
}
