# AI Enhancer Pro 🚀✨

A stunning, responsive web application for enhancing images with AI-style automatic enhancement and manual editing tools!

## Features 🌟

- 📸 **Multiple Image Upload**: Drag and drop images or use the file picker
- 🤖 **Automatic Enhancement**: One-click "AI-style" enhancement using canvas filters
- 🎨 **Manual Editing Suite**: Professional tools for brightness, contrast, saturation, and blur
- 🧪 **Before/After Slider**: Interactive Remini-style comparison
- 📥 **Download All in ZIP**: Batch download all enhanced images
- 🌓 **Dark/Light Mode**: Beautiful themes with automatic system detection
- 📱 **Fully Responsive**: Perfect on mobile, tablet, laptop, and desktop
- 🔍 **Fullscreen View**: View your images in stunning fullscreen mode

## Built With 🛠️

- [Next.js 16](https://nextjs.org/) - Modern React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety and better developer experience
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Beautiful animations
- [Lucide React](https://lucide.dev/) - Beautiful, consistent icons
- [JSZip](https://stuk.github.io/jszip/) - ZIP file handling
- [React Dropzone](https://react-dropzone.js.org/) - Drag and drop uploader

## Getting Started 🚀

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see it in action!

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Usage 📖

1. **Upload Images**: Drag and drop photos or use the upload area
2. **Enhance**: Click "Enhance" on individual photos or "Auto Enhance All"
3. **Compare**: Use the before/after slider to see the difference
4. **Edit (Optional)**: Fine-tune manually using the "Edit" button
5. **Download**: Save individual images or download all in a ZIP file

## Project Structure 📂

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Main app page
├── components/
│   ├── BeforeAfterSlider.tsx  # Before/after comparison
│   ├── FullscreenModal.tsx    # Fullscreen view
│   ├── ImageCard.tsx          # Image card component
│   ├── ImageEditor.tsx        # Manual editing tools
│   └── ImageUploader.tsx      # Upload area
└── lib/
    └── utils.ts           # Utility functions
```

## License 📄

MIT License - feel free to use this project as you like!

## Author ✨

Built with ❤️
