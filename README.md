# ReactaForm

A powerful, type-safe React form builder library with dynamic field rendering, conditional visibility, multi-language support, and extensible validation. Built with TypeScript and React 19+.

## 📦 Monorepo Structure

This repository contains:
- **`packages/reactaform/`** - The core library (published to npm)
- **`packages/apps/`** - Demo applications showcasing library features

## 🚀 ReactaForm Library

ReactaForm is a comprehensive form solution that enables you to build dynamic, type-safe forms from JSON definitions. It's bundler-agnostic and works seamlessly with Vite, webpack, Next.js, and other modern build tools.

### Key Features

- 🎯 **Type-Safe** - Full TypeScript support with generic field types
- 🎨 **Themeable** - CSS variables for easy customization (light/dark mode built-in)
- 🌍 **i18n Ready** - Built-in internationalization with translation caching
- 🔌 **Extensible** - Registry pattern for custom components, validators, and handlers
- ⚡ **Performance** - Virtual scrolling, debounced inputs, RAF-based state management
- 🎭 **Conditional Logic** - Field visibility based on parent field values
- 📱 **Responsive** - Works seamlessly across devices
- ♿ **Accessible** - ARIA attributes and keyboard navigation support
- 🧩 **20+ Field Types** - Text, email, phone, dropdown, checkbox, slider, rating, date, file upload, and more

### Installation

```bash
npm install reactaform react react-dom
```

See [`packages/reactaform/README.md`](packages/reactaform/README.md) for complete documentation.

## 🎮 Demo Applications

The `packages/apps/` directory contains working examples demonstrating various ReactaForm features:

### **instance-app**
Demonstrates instance management - create, load, edit, and save multiple form instances. Shows how to:
- Create new instances from definitions
- Load instances from JSON
- Edit instance values and names
- Handle form submission with instance updates

### **group-app**
Shows how to organize form fields into logical groups (e.g., "Personal Information", "Contact Details"). Demonstrates:
- Field grouping for better UX
- Collapsible sections
- Visual organization of complex forms

### **parents-app**
Showcases conditional field visibility based on parent field values. Features:
- Parent-child field relationships
- Dynamic show/hide logic
- Cascading dropdowns
- Multi-level conditional rendering

### **custom-validation-app**
Demonstrates custom validation patterns. Shows how to:
- Register custom validators
- Implement field-specific validation logic
- Display custom error messages
- Handle async validation

### **translation-app**
Multi-language form support with custom translations. Demonstrates:
- Language switching
- Custom translation files
- Localized field labels and messages
- RTL support preparation

### **dark-mode-app**
Theme customization and dark mode support. Features:
- Light/dark theme switching
- CSS variable customization
- Dynamic theme changes
- Persistent theme preferences

### **submit-handler-app**
Custom form submission handling. Shows how to:
- Register submission handlers
- Process form data
- Handle validation errors
- Display success/error messages

### **custom-styles-app**
Advanced CSS customization and theming. Demonstrates:
- Custom CSS variable overrides
- Component-level styling
- Brand-specific themes
- Responsive design patterns

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Install dependencies
npm install

# Build the library
cd packages/reactaform
npm run build:lib

# Run a demo app
cd packages/apps/instance-app
npm run dev
```

### Available Scripts

```bash
# In packages/reactaform/
npm run build:lib    # Build library for distribution
npm run test         # Run test suite
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint

# In any demo app/
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📖 Documentation

- [Library Documentation](packages/reactaform/README.md) - Complete API reference and guides
- [Demo Apps](packages/apps/README.md) - Detailed examples and use cases

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT - See [LICENSE](packages/reactaform/LICENSE) for details

---

**Built with ❤️ using React and TypeScript**
