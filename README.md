# 🍔 Yummy Burgers — Food Landing Page

A modern, interactive food/restaurant landing page built with **Angular**, featuring animated food sections, a signature menu, ingredient storytelling, and a cooking-process showcase.

The page is designed around a bold editorial food aesthetic with large typography, food imagery, scrolling animations, marquee sections, and interactive menu cards.

---

## ✨ Features

### 🏠 Hero Food Carousel

The landing section contains multiple food-focused slides:

* Shawarma / Wrap
* Yummy Burgers
* Pasta
* Momos
* Animated food imagery
* Large editorial headlines
* Scroll indicator
* Brand identity: **Yummy Burgers**

The hero contains four primary slides with individual backgrounds, watermarks, taglines, and headlines.

---

### 🔄 Animated Marquee Sections

Two horizontal scrolling ticker sections are included.

#### Yellow Marquee

Highlights:

* No shortcuts
* No fillers
* High protein
* Freshly prepared
* No preservatives

#### Red Marquee

Highlights:

* Bold taste
* Made to order
* Bold flavour

These sections provide continuous movement and visual separation between the major content blocks.

---

## 🌯 Wrap Benefits Section

The wrap section explains the ingredients and nutritional benefits of the restaurant's wraps.

### Benefits

* 🥬 Farm Fresh Vegetables
* 🥩 High Protein Filling
* 🌾 Rich In Fiber
* 🌿 Fresh Herbs

The section also contains a large wrap/shawarma image alongside the descriptive content.

---

## 🍽️ Signature Menu

The **Signature Menu** section showcases the restaurant's featured dishes.

It includes:

* Menu heading and introductory copy
* Featured hero food image
* Dynamic food cards
* Dish categories
* Dish names
* Prices
* Descriptions
* Add to Cart / Order Now buttons
* Link to the complete menu

The dishes are rendered dynamically using Angular's `*ngFor`:

```html
<article *ngFor="let dish of dishes; let i = index; trackBy: trackByDishId">
```

Each dish uses properties such as:

```text
dish.image
dish.alt
dish.category
dish.name
dish.price
dish.description
dish.featured
```

---

## 🥬 Ingredient Journey

The Ingredient Journey section visually explains how fresh ingredients become the final food product.

### Ingredients

* Tortilla Wrap
* Lettuce
* Onion
* Tomato
* Grilled Chicken
* Cheese
* Signature Sauce

The ingredients are positioned individually and lead into a final assembled shawarma image.

### Visual Concept

```text
Fresh Ingredients
       ↓
   Preparation
       ↓
   Layering
       ↓
   Assembly
       ↓
🌯 Final Shawarma
```

The section also includes a glow effect and steam particles around the final product.

---

## 👨‍🍳 Cooking Process

The final section presents the preparation process as a sequence of animated food elements.

### Cooking Steps

1. Fresh Tortilla
2. Grilled Chicken
3. Melted Cheese
4. Fresh Vegetables
5. Signature Sauce
6. Final Wrapped Shawarma

The vegetables are split into multiple elements to allow staggered animation effects.

---

## 📁 Asset Structure

The HTML references assets using paths similar to:

```text
assets/
├── home/
│   ├── shawarma_roll.png
│   ├── burger.png
│   ├── pasta.png
│   └── momos.png
│
├── sig_menu/
│   └── Shawarma.jpg
│
└── ingredients/
    ├── wrap.png
    ├── lettuce.png
    ├── onion.png
    ├── tomato.png
    ├── chicken.png
    ├── cheese.png
    ├── sauce.png
    └── shawarma.png
```

The exact files and locations should match the paths configured in the Angular project's `src/assets` directory.

---

## 🧩 Angular Integration

The template uses Angular-specific functionality including:

* `*ngFor`
* `trackBy`
* Property binding
* Class binding
* Style binding
* Template reference variables
* `routerLink`

Examples:

```html
[class.is-visible]="isVisible"
```

```html
[style.--i]="i"
```

```html
<img [src]="dish.image" [alt]="dish.alt" loading="lazy" />
```

```html
<a routerLink="/menu">
    View Full Menu
</a>
```

---

## 🎨 Design Highlights

The page follows a modern food-branding style with:

* Large editorial typography
* High-impact food photography
* Full-width sections
* Animated scrolling elements
* Watermark typography
* Floating food images
* Ingredient animations
* Interactive menu cards
* Strong visual hierarchy
* Responsive layout potential

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Angular Development Server

```bash
ng serve
```

Then open:

```text
http://localhost:4200
```

### 3. Build for Production

```bash
ng build
```

The production build will be generated in the Angular project's configured `dist` directory.

---

## 🛠️ Customization

### Add a New Dish

Add a new object to the `dishes` array in the corresponding Angular component:

```typescript
{
  name: 'Chicken Shawarma',
  category: 'Signature',
  price: '$9.99',
  description: 'Freshly prepared shawarma with grilled chicken and signature sauce.',
  image: '/assets/sig_menu/Shawarma.jpg',
  alt: 'Chicken Shawarma',
  featured: true
}
```

### Change Food Images

Replace the corresponding files inside:

```text
src/assets/home/
src/assets/sig_menu/
src/assets/ingredients/
```

### Change Menu Route

The full menu currently uses:

```html
routerLink="/menu"
```

Update this route if your Angular application uses a different menu URL.

---

## 📱 Responsive Design

The page should be styled to support:

* Desktop screens
* Tablets
* Mobile devices

For mobile optimization, the hero images, typography, menu cards, ingredient animations, and cooking-process elements should be adjusted through responsive CSS media queries.

---

## ♿ Accessibility

The template already includes useful accessibility practices such as:

* `alt` attributes for food images
* Semantic `<section>`, `<article>`, `<header>`, and `<footer>` elements
* `aria-labelledby`
* `aria-hidden`
* Semantic buttons
* Lazy loading for menu images

Example:

```html
<img [src]="dish.image" [alt]="dish.alt" loading="lazy" />
```

---

## 📌 Project Structure

A recommended Angular structure is:

```text
src/
├── app/
│   ├── home/
│   │   ├── home.component.html
│   │   ├── home.component.scss
│   │   └── home.component.ts
│   │
│   ├── menu/
│   │   ├── menu.component.html
│   │   ├── menu.component.scss
│   │   └── menu.component.ts
│   │
│   └── ...
│
├── assets/
│   ├── home/
│   ├── sig_menu/
│   └── ingredients/
│
└── styles.scss
```

---

## 🔮 Future Improvements

Potential improvements include:

* Add real **Add to Cart** functionality
* Connect menu items to a backend/API
* Add food item detail pages
* Add online ordering
* Add cart and checkout
* Add authentication
* Add restaurant location/contact section
* Add customer reviews
* Add loading animations
* Improve mobile-specific animations
* Add reduced-motion support throughout all animations
* Add SEO metadata
* Optimize food images using WebP/AVIF
* Add lazy loading to all non-critical images

---

## 📄 License

This project can be licensed according to the requirements of the project owner.

---

## 👨‍💻 Technologies

* **Angular**
* **TypeScript**
* **HTML5**
* **SCSS/CSS**
* **Angular Router**
* **Responsive Web Design**
* **CSS Animations**
* **Food Photography / Image Assets**
