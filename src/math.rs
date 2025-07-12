//! Linear algebra primitives.

#[cfg(feature = "dim3")]
use js_sys::Float64Array;
#[cfg(feature = "dim3")]
use na::{Quaternion, Unit};
use rapier::math::{Point, Rotation, Vector};
#[cfg(feature = "dim3")]
use rapier::parry::utils::SdpMatrix3;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(transparent)]
#[derive(Copy, Clone)]
/// A rotation quaternion.
pub struct RawRotation(pub(crate) Rotation<f64>);

impl From<Rotation<f64>> for RawRotation {
    fn from(v: Rotation<f64>) -> Self {
        RawRotation(v)
    }
}

#[wasm_bindgen]
#[cfg(feature = "dim2")]
/// A unit complex number describing the orientation of a Rapier entity.
impl RawRotation {
    /// The identity rotation.
    pub fn identity() -> Self {
        Self(Rotation::identity())
    }

    /// The rotation with thegiven angle.
    pub fn fromAngle(angle: f64) -> Self {
        Self(Rotation::new(angle))
    }

    /// The imaginary part of this complex number.
    #[wasm_bindgen(getter)]
    pub fn im(&self) -> f64 {
        self.0.im
    }

    /// The real part of this complex number.
    #[wasm_bindgen(getter)]
    pub fn re(&self) -> f64 {
        self.0.re
    }

    /// The rotation angle in radians.
    #[wasm_bindgen(getter)]
    pub fn angle(&self) -> f64 {
        self.0.angle()
    }
}

#[wasm_bindgen]
#[cfg(feature = "dim3")]
/// A unit quaternion describing the orientation of a Rapier entity.
impl RawRotation {
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64, z: f64, w: f64) -> Self {
        RawRotation(Unit::new_unchecked(Quaternion::new(w, x, y, z)))
    }

    /// The identity quaternion.
    pub fn identity() -> Self {
        Self(Rotation::identity())
    }

    /// The `x` component of this quaternion.
    #[wasm_bindgen(getter)]
    pub fn x(&self) -> f64 {
        self.0.i
    }

    /// The `y` component of this quaternion.
    #[wasm_bindgen(getter)]
    pub fn y(&self) -> f64 {
        self.0.j
    }

    /// The `z` component of this quaternion.
    #[wasm_bindgen(getter)]
    pub fn z(&self) -> f64 {
        self.0.k
    }

    /// The `w` component of this quaternion.
    #[wasm_bindgen(getter)]
    pub fn w(&self) -> f64 {
        self.0.w
    }
}

#[wasm_bindgen]
#[repr(transparent)]
#[derive(Copy, Clone)]
/// A vector.
pub struct RawVector(pub(crate) Vector<f64>);

impl From<Vector<f64>> for RawVector {
    fn from(v: Vector<f64>) -> Self {
        RawVector(v)
    }
}

impl From<Point<f64>> for RawVector {
    fn from(pt: Point<f64>) -> Self {
        pt.coords.into()
    }
}

#[wasm_bindgen]
impl RawVector {
    /// Creates a new vector filled with zeros.
    pub fn zero() -> Self {
        Self(Vector::zeros())
    }

    /// Creates a new 2D vector from its two components.
    ///
    /// # Parameters
    /// - `x`: the `x` component of this 2D vector.
    /// - `y`: the `y` component of this 2D vector.
    #[cfg(feature = "dim2")]
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64) -> Self {
        Self(Vector::new(x, y))
    }

    /// Creates a new 3D vector from its two components.
    ///
    /// # Parameters
    /// - `x`: the `x` component of this 3D vector.
    /// - `y`: the `y` component of this 3D vector.
    /// - `z`: the `z` component of this 3D vector.
    #[cfg(feature = "dim3")]
    #[wasm_bindgen(constructor)]
    pub fn new(x: f64, y: f64, z: f64) -> Self {
        Self(Vector::new(x, y, z))
    }

    /// The `x` component of this vector.
    #[wasm_bindgen(getter)]
    pub fn x(&self) -> f64 {
        self.0.x
    }

    /// Sets the `x` component of this vector.
    #[wasm_bindgen(setter)]
    pub fn set_x(&mut self, x: f64) {
        self.0.x = x
    }

    /// The `y` component of this vector.
    #[wasm_bindgen(getter)]
    pub fn y(&self) -> f64 {
        self.0.y
    }

    /// Sets the `y` component of this vector.
    #[wasm_bindgen(setter)]
    pub fn set_y(&mut self, y: f64) {
        self.0.y = y
    }

    /// The `z` component of this vector.
    #[cfg(feature = "dim3")]
    #[wasm_bindgen(getter)]
    pub fn z(&self) -> f64 {
        self.0.z
    }

    /// Sets the `z` component of this vector.
    #[cfg(feature = "dim3")]
    #[wasm_bindgen(setter)]
    pub fn set_z(&mut self, z: f64) {
        self.0.z = z
    }

    /// Create a new 2D vector from this vector with its components rearranged as `{x, y}`.
    #[cfg(feature = "dim2")]
    pub fn xy(&self) -> Self {
        Self(self.0.xy())
    }

    /// Create a new 2D vector from this vector with its components rearranged as `{y, x}`.
    #[cfg(feature = "dim2")]
    pub fn yx(&self) -> Self {
        Self(self.0.yx())
    }

    /// Create a new 2D vector from this vector with its components rearranged as `{z, y}`.
    #[cfg(feature = "dim2")]
    #[cfg(feature = "dim3")]
    pub fn zy(&self) -> Self {
        Self(self.0.zy())
    }

    /// Create a new 3D vector from this vector with its components rearranged as `{x, y, z}`.
    ///
    /// This will effectively return a copy of `this`. This method exist for completeness with the
    /// other swizzling functions.
    #[cfg(feature = "dim3")]
    pub fn xyz(&self) -> Self {
        Self(self.0.xyz())
    }

    /// Create a new 3D vector from this vector with its components rearranged as `{y, x, z}`.
    #[cfg(feature = "dim3")]
    pub fn yxz(&self) -> Self {
        Self(self.0.yxz())
    }

    /// Create a new 3D vector from this vector with its components rearranged as `{z, x, y}`.
    #[cfg(feature = "dim3")]
    pub fn zxy(&self) -> Self {
        Self(self.0.zxy())
    }

    /// Create a new 3D vector from this vector with its components rearranged as `{x, z, y}`.
    #[cfg(feature = "dim3")]
    pub fn xzy(&self) -> Self {
        Self(self.0.xzy())
    }

    /// Create a new 3D vector from this vector with its components rearranged as `{y, z, x}`.
    #[cfg(feature = "dim3")]
    pub fn yzx(&self) -> Self {
        Self(self.0.yzx())
    }

    /// Create a new 3D vector from this vector with its components rearranged as `{z, y, x}`.
    #[cfg(feature = "dim3")]
    pub fn zyx(&self) -> Self {
        Self(self.0.zyx())
    }
}

#[wasm_bindgen]
#[repr(transparent)]
#[derive(Copy, Clone)]
#[cfg(feature = "dim3")]
pub struct RawSdpMatrix3(pub(crate) SdpMatrix3<f64>);

#[cfg(feature = "dim3")]
impl From<SdpMatrix3<f64>> for RawSdpMatrix3 {
    fn from(v: SdpMatrix3<f64>) -> Self {
        RawSdpMatrix3(v)
    }
}

#[wasm_bindgen]
#[cfg(feature = "dim3")]
impl RawSdpMatrix3 {
    /// Row major list of the upper-triangular part of the symmetric matrix.
    pub fn elements(&self) -> Float64Array {
        let m = self.0;
        let output = Float64Array::new_with_length(6);
        // Convert f64 to f64 for JavaScript
        #[cfg(feature = "f64")]
        output.copy_from(&[
            m.m11 as f64, m.m12 as f64, m.m13 as f64, 
            m.m22 as f64, m.m23 as f64, m.m33 as f64
        ]);
        #[cfg(not(feature = "f64"))]
        output.copy_from(&[
            m.m11 as f32, m.m12 as f32, m.m13 as f32, 
            m.m22 as f32, m.m23 as f32, m.m33 as f32
        ]);
        output
    }
}
