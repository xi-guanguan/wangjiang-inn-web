/*
 * Narrow Runtime Adapter for Three.js only. It does not emulate DOM layout or
 * CSS and is never imported by the Canvas UI runtime.
 */
(function (global) {
  function readGlobal(name) {
    try {
      return global[name]
    } catch (_) {
      return undefined
    }
  }
  function installGlobal(name, fallback) {
    var current = readGlobal(name)
    if (current != null) return current

    try {
      var descriptor = Object.getOwnPropertyDescriptor(global, name)
      if (!descriptor || descriptor.configurable) {
        Object.defineProperty(global, name, {
          value: fallback,
          writable: true,
          configurable: true,
        })
      } else if ('value' in descriptor && descriptor.writable) {
        global[name] = fallback
      }
    } catch (_) {
      // Some Mini Game hosts expose globals through immutable accessors.
    }
    return readGlobal(name) || fallback
  }
  function decorateCanvas(canvas) {
    if (!canvas) return canvas
    canvas.style = canvas.style || {}
    canvas.addEventListener = canvas.addEventListener || function () {}
    canvas.removeEventListener = canvas.removeEventListener || function () {}
    canvas.setAttribute = canvas.setAttribute || function () {}
    canvas.getBoundingClientRect = canvas.getBoundingClientRect || function () {
      return { left: 0, top: 0, width: canvas.width || 1, height: canvas.height || 1 }
    }
    return canvas
  }
  var adapterDocument = readGlobal('document') || {
    createElementNS: function () { return decorateCanvas(global.wx && global.wx.createCanvas ? global.wx.createCanvas() : null) },
    createElement: function () { return decorateCanvas(global.wx && global.wx.createCanvas ? global.wx.createCanvas() : null) },
  }
  installGlobal('window', global)
  installGlobal('self', global)
  installGlobal('document', adapterDocument)
  installGlobal('navigator', { userAgent: 'wechat-minigame' })
  global.HerbMiniGameThreeAdapter = { decorateCanvas: decorateCanvas }
}(globalThis))
