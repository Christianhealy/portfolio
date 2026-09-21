# Lumina Grid

Build a premium, high-end photography and cinematography portfolio website using Vite, React, and Tailwind CSS. The site will be hosted on Cloudflare Pages.



DESIGN REQUIREMENTS:

1. Use an ultra-minimalist, editorial dark-mode aesthetic (deep blacks, clean grays, plenty of negative whitespace, elegant modern typography).

2. Create a responsive masonry grid gallery that handles both photos and video thumbnails seamlessly.

3. Include smooth, cinematic fade-in scroll animations.

4. Implement a flawless lightbox modal window. Clicking an image expands it beautifully; clicking a video streams it in an embedded player modal.



ARCHITECTURE REQUIREMENTS (CRITICAL):

1. I am technical but do not write code. I want to host all photography assets locally inside this project's code repository instead of using an external cloud dashboard.

2. Create a local folder structure specifically named `public/images/portfolio/`.

3. Create a clean, dedicated database file named `public/portfolio.json`. The application must read and dynamically build the gallery grid entirely from this JSON file.

4. Set up the JSON array structure with simple keys: id, type ("image" or "video"), title, mediaUrl, and category.

5. In the JSON file, format the mediaUrl fields to use local repo file paths (e.g., "/images/portfolio/photo1.jpg") for images, and standard external stream URLs (like YouTube/Vimeo) for videos.

6. Populate the `public/images/portfolio/` folder with 3 beautiful, highly visual placeholder images so I can clearly see how the storage directory works.

```

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/085b2e97-2e52-4f8e-80f2-8863a35a115e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
