// src/utils/anime.js
// animejs v3.2.1 — no "exports" field, bare import works with CRA webpack
import anime from 'animejs'; // eslint-disable-line import/no-unresolved

export { anime };

export function fadeUp(targets, delay = 0, duration = 700) {
  anime({ targets, opacity: [0, 1], translateY: [30, 0], easing: 'easeOutExpo', duration, delay: anime.stagger(80, { start: delay }) });
}

export function staggerReveal(targets, delay = 0) {
  anime({ targets, opacity: [0, 1], translateY: [20, 0], scale: [0.96, 1], easing: 'easeOutCubic', duration: 600, delay: anime.stagger(60, { start: delay }) });
}

export function pulse(target) {
  anime({ targets: target, scale: [1, 0.97, 1], duration: 300, easing: 'easeInOutQuad' });
}

export function countUp(el, end, duration = 1200, prefix = '', suffix = '') {
  const obj = { value: 0 };
  anime({ targets: obj, value: end, duration, easing: 'easeOutExpo', round: 1, update() { if (el) el.textContent = prefix + obj.value.toLocaleString('en-IN') + suffix; } });
}

export function flyPlane(target) {
  anime({ targets: target, translateX: ['-120%', '120%'], rotate: [-3, -3], opacity: [0, 0.7, 0.7, 0], duration: 3200, easing: 'easeInOutSine' });
}

export function cardEntrance(targets) {
  anime({ targets, opacity: [0, 1], scale: [0.94, 1], translateY: [16, 0], easing: 'easeOutQuart', duration: 500, delay: anime.stagger(50) });
}

export function animateProgress(target, toWidth) {
  anime({ targets: target, width: [0, toWidth + '%'], easing: 'easeOutExpo', duration: 900 });
}

export function underlineReveal(target) {
  anime({ targets: target, scaleX: [0, 1], easing: 'easeOutExpo', duration: 600, transformOrigin: 'left center' });
}
