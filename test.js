/**
 * 判断 obj 的原型链上是否出现 ctor.prototype（语义接近 instanceof，不处理 Symbol.hasInstance）
 * @param {object} obj
 * @param {Function} ctor
 */
function Interfaceof(obj, ctor) {
  if (obj == null || typeof ctor !== 'function') return false;

  const target = ctor.prototype;
  // 例如 Object.create(null) 作为构造函数时 prototype 可能异常
  if (target == null) return false;

  // 原始类型没有原型链参与 instanceof（除装箱对象外一般直接 false）
  const type = typeof obj;
  if (type !== 'object' && type !== 'function') return false;

  let p = obj;
  while (p != null) {
    if (p === target) return true;
    p = Object.getPrototypeOf(p);
  }
  return false;
}
