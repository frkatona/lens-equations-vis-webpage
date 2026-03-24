# lens-equations-vis-webpage

Static thin-lens optics playground for exploring focal length, focus distance, sensor distance, aperture, circle of confusion, blur, magnification, depth of field, and hyperfocal distance.

Open `index.html` in a browser.

## Terms

- `f`: focal length.
- `N`: f-number.
- `c` / `CoC`: circle-of-confusion threshold used to decide what counts as "acceptably sharp".
- `s`: focus distance, the object distance chosen to be perfectly sharp.
- `s'`: image distance, the sensor/image-plane distance required to focus at `s`.
- `z`: probe distance, an arbitrary test distance used to evaluate blur under the current focus setting.
- `subject distance`: a generic object distance in a derivation or graph; when the chosen subject is in focus, it is `s`.
- `foreground` / `background`: extra sampled scene planes placed nearer/farther than the probe plane for the scene preview.

## Hyperfocal Distance

`H` is the focus distance that makes the far depth-of-field limit reach infinity for the chosen `f`, `N`, and `CoC`. It is not a universal lens constant; it changes when focal length, aperture, or CoC changes.

## Equations

Assume a thin lens and consistent units.

$$
\frac{1}{f} = \frac{1}{s} + \frac{1}{s'}
$$

$$
s' = \frac{f s}{s - f}
$$

$$
m = -\frac{s'}{s}
$$

$$
D = \frac{f}{N}
$$

$$
z' = \frac{f z}{z - f}
$$

$$
c(z) = D \frac{\left| s'_{\text{focus}} - z' \right|}{z'}
$$

$$
H = \frac{f^2}{N c} + f
$$

$$
\text{near} = \frac{H s}{H + (s - f)}
$$

$$
\text{far} =
\begin{cases}
\frac{H s}{H - (s - f)}, & H > (s - f) \\
\infty, & \text{otherwise}
\end{cases}
$$

$$
\text{DOF} = \text{far} - \text{near}
$$

## Accuracy Limits

- Replace the thin lens with a thick-lens or real zoom model with moving principal planes and focus breathing.
- Use entrance/exit pupil geometry and pupil magnification, not only \( D = f/N \).
- Model diffraction, aberrations, field curvature, distortion, and vignetting.
- Derive CoC from sensor size, output size, viewing distance, and sharpness criterion instead of treating it as fixed.
- Use measured lens data and real scene geometry for the preview instead of idealized sampled planes.

## to-do

- [ ] add checkboxes to the optical blur card to incorporate simulation of different effects.  One will obviously be depth of field, then add 'brightness', 'crop', 

- [x] make the light visibly enter through the aperture

- [ ] guiding exercises
  - "start with close-up and see how narrow the window of subject distances is where the CoC is focused

- [ ] where should the aperture be?

- [ ] how many actual glass lenses are there usually?  does it change with different types of lenses?