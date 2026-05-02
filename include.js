// navbar.js
document.addEventListener('DOMContentLoaded', function() {
  const nav = `
  <nav class="navbar">
    <div class="nav-brand">
      <img src="https://scffeni.github.io/scffeni/logo.jpg" alt="logo">
      <a href="https://scffeni.github.io/scffeni/index.html">সোনাগাজী কালচারাল ফোরাম,ফেনী</a>
    </div>
    <button class="menu-toggle">☰</button>
    <ul class="nav-links">
      <li><a href="https://scffeni.github.io/scffeni/index.html">হোম</a></li>
      <li><a href="https://scffeni.github.io/scffeni/about.html">আমাদের সম্পর্কে</a></li>
      <li><a href="https://scffeni.github.io/scffeni/events.html">সাংস্কৃতিক অনুষ্ঠান</a></li>
      <li><a href="https://scffeni.github.io/scffeni/leaders.html">নেতৃত্ব</a></li>
      <li><a href="https://scffeni.github.io/scffeni/gallery.html">গ্যালারি</a></li>
      <li><a href="https://scffeni.github.io/scffeni/contact.html">যোগাযোগ</a></li>
    </ul>
  </nav>`;
  
  document.getElementById('navbar-container').innerHTML = nav;
});
