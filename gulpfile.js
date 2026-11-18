import gulp from "gulp";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";
import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

const sass = gulpSass(dartSass);
const SRC = "src/scss/**/*.scss";
const OUT = "public/assets/css";
const isProd = process.env.NODE_ENV === "production" || process.env.NETLIFY === "true";

// Gulp 5 genera los mapas de origen por sí solo (ya no hace falta gulp-sourcemaps).
export function styles() {
  return gulp
    .src("src/scss/main.scss", { sourcemaps: !isProd })
    .pipe(sass.sync({ style: "expanded" }).on("error", sass.logError))
    .pipe(postcss(isProd ? [autoprefixer(), cssnano({ preset: "default" })] : [autoprefixer()]))
    .pipe(gulp.dest(OUT, { sourcemaps: isProd ? false : "." }));
}

export function watch() {
  gulp.watch(SRC, styles);
}

export const build = styles;
export default gulp.series(styles, watch);
