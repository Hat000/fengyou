/**
 * Random tagline picker
 */

const TAGLINES = [
  '"Making electrons do useless things — some more useless than others."',
  '"I build things that fly, things that think, and things nobody asked for."',
  '"Somewhere between the schematic and the crash log is where I live."',
  '"If it doesn\'t have a battery, I\'m probably not interested."',
  '"Building at the edge of hardware and sky."',
  '"Transmitting from Princeton, NJ."',
];

export function initTaglines() {
  const el = document.getElementById('tagline');
  if (el) {
    el.textContent = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
  }
}
