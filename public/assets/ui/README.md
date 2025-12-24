# UI Assets

This folder contains all UI elements (cards, panels, buttons, navigation icons, action icons).

## Folder Structure

```
ui/
├── cards/          # Card backgrounds for different components
├── panels/         # Panel/container backgrounds
├── buttons/        # Button states (primary, secondary, etc.)
├── nav/            # Bottom navigation icons
├── actions/        # Action button icons (gather, build, upgrade, etc.)
└── logo.png        # Game logo
```

## Current Status

All UI elements currently use Tailwind CSS styling as fallbacks. Drop PNG files here to replace with custom graphics!

## Asset Naming

Follow these naming conventions:
- Cards: `card_{type}.png` (e.g., `card_automation.png`)
- Panels: `panel_{type}.png` (e.g., `panel_main.png`)
- Buttons: `btn_{type}.png` (e.g., `btn_primary.png`)
- Navigation: `nav_{screen}.png` (e.g., `nav_home.png`)
- Actions: `action_{name}.png` (e.g., `action_gather.png`)
