# How-to create `dep-font`

The idea here is to create a custom font on which documentation icons are linked to characters:

* `A` : Home icon in navbar
* `B` : Documentation icon in navbar
* `C` : Quick Links icon in navbar
* etc.

## Pre-requisites

* Images available as diagrams (or better as vectorial images, ex. SVG)
* InkScape installed (`choco install inkscape`)
* FontForge installed (`choco install fontforge`)

## Create the `dep-font`

If you've got some vectorial images for the icons, you can directly go to `Create the font` section.

### Convert images into vectorial images (SVG)

* Import the PNG image in InkScape: `File > Import`
* Select the object imported and vectorize it:
  * `Path > Vectorize a matricial object`
  * Use `Treshold` and try to find the best value with the overview
  * `Validate`
* Copy the new created object to a new file in InkScape
* Adjust size : `Edition > Adjust page size to selection`
* Save as SVG (InkScape SVG is OK) : `File > Save as...`

### Create the font

For each icon, you want to associate to a character:

* Open FontForge and select `New Font`
* Double-click on character you want to edit (for ex: `1`)
* `File > import`
* If you need to center vertically the glyph, just select all (`CTRL+A`) et move up or down using your keyboard arrows

Finally:

* save the font (as .sfd) to be able to edit it again
* generate the font, as Woff 2 format : `File > Generate Font > Generate` (just accept the errors if you've got some or fix them if you're brave ;))

### Use `dep-font` in website

* Import the font into your CSS, and declare a class to use it
N.B.: in the documentation, the CSS file used is `assets/scss/_styles_project.scss`

```css
@font-face {
    font-family: "dep-font";
    src: url("../fonts/dep-font.woff2") format("woff2");
}

.dep-font {
    font-family: "dep-font" !important;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    font-display: block;
    text-transform: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1;
}
```

* Then use your CSS class to use your font

For example, the following line will display the glyph associated to `A` character.

```html
<i class='dep-font'>A</i>
```

Enjoy !
