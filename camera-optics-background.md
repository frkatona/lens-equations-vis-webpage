
# Camera Optics Background

## 1. Thin Lens Equation (Focus)

The fundamental imaging relation:

$$
\frac{1}{f} = \frac{1}{s_o} + \frac{1}{s_i}
$$

Where:

- $f$ = focal length  
- $s_o$ = object distance (from principal plane)  
- $s_i$ = image distance (to sensor / film plane)

Re‑arranged:

$$
s_i = \frac{f s_o}{s_o - f}
$$

### Focus at Infinity

For $s_o \rightarrow \infty$:

$$
s_i \approx f
$$

Thus lenses are designed so that the sensor sits approximately one focal length behind the rear principal plane for distant focus.

---

## 2. Magnification

Lateral magnification:

$$
m = -\frac{s_i}{s_o}
$$

Using thin lens relation:

$$
m = -\frac{f}{s_o - f}
$$

Macro photography approaches:

$$
|m| \approx 1
$$

which occurs when:

$$
s_o \approx 2f, \quad s_i \approx 2f
$$

---

## 3. f‑Number and Aperture

Definition:

$$
N = \frac{f}{D}
$$

Where:

- $N$ = f‑number  
- $D$ = entrance pupil diameter  

Light irradiance at sensor:

$$
E \propto \frac{1}{N^2}
$$

Depth of field increases with larger $N$.  

---

## 4. Circle of Confusion

Defocus blur diameter:

$$
c \approx \frac{D | \Delta s_i |}{s_i}
$$

Where $\Delta s_i$ is deviation from perfect focus plane.

Depth of field approximations:

Near limit:

$$
s_{near} = \frac{s f^2}{f^2 + N c (s - f)}
$$

Far limit:

$$
s_{far} = \frac{s f^2}{f^2 - N c (s - f)}
$$

---

## 5. Field of View

For sensor dimension $d$:

$$
\theta = 2 \arctan \left( \frac{d}{2f} \right)
$$

---

## 6. Lens Element Arrangements

Real photographic lenses are **multi‑element systems**, not single thin lenses.

Typical counts:

- Simple prime: 5–7 elements  
- Modern fast prime: 8–14 elements  
- Zoom lens: 15–25+ elements  

### Common Groups

- Front positive group (primary convergence)
- Variator group (zooming lenses)
- Compensator group (maintains focus during zoom)
- Rear relay group
- Floating focus group (close‑focus correction)

### Aperture Placement

The aperture must sit near a **pupil conjugate location**, typically:

- Between front and rear groups  
- Often near the optical power centroid  
- Positioned so that aberration balance is maintained

In telephoto lenses:

- Aperture tends to sit **forward of the mid‑plane**

In retrofocus wide‑angle lenses:

- Aperture sits **rearward relative to strong negative front group**

---

## 7. Telephoto Ratio

Defined:

$$
T = \frac{\text{physical length}}{f}
$$

Telephoto lenses achieve:

$$
T < 1
$$

Using negative rear groups.

---

## 8. Retrofocus Condition

Back focal distance:

$$
\text{BFD} > f
$$

Achieved using:

- Strong negative front element
- Positive relay groups

Necessary for:

- SLR mirror clearance
- Modern sensor stack spacing

---

## 9. Aberration Control Principles

Key Seidel aberrations:

- Spherical
- Coma
- Astigmatism
- Field curvature
- Distortion

Mitigation methods:

- Symmetric double‑Gauss layout
- Aspheric elements
- Low dispersion glass
- Floating element groups

---

## 10. Zoom Lens Parfocal Constraint

During zoom:

$$
\frac{ds_i}{dz} = 0
$$

Meaning image plane must remain fixed while effective focal length changes.

Achieved via coordinated motion of variator and compensator groups.

---

## 11. Entrance and Exit Pupils

Magnification between them:

$$
P = \frac{D_{exit}}{D_{entrance}}
$$

Affects:

- Vignetting
- Effective f‑number
- Off‑axis illumination

---

## 12. Diffraction Limit

Airy disk diameter:

$$
d_A = 2.44 \lambda N
$$

Thus stopping down increases diffraction blur.

---

## 13. Hyperfocal Distance

$$
H = \frac{f^2}{N c} + f
$$

When focused at $H$:

Depth of field spans from:

$$
\frac{H}{2} \rightarrow \infty
$$

---

## 14. Modern Lens Design Trends

- Increasing element counts for computational correction
- Internal focusing
- Electromagnetic aperture control
- Image stabilization groups
- Short back focal distances for mirrorless systems

