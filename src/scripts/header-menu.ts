document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle') as HTMLButtonElement | null;
  const dropdownMenu = document.getElementById('dropdown-menu') as HTMLDivElement | null;

  // Localise the dynamic aria-label off the page's <html lang>.
  const en = document.documentElement.lang === 'en';
  const LABEL = {
    open: en ? 'Open menu' : '메뉴 열기',
    close: en ? 'Close menu' : '메뉴 닫기',
  };

  if (menuToggle && dropdownMenu) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menuToggle.classList.toggle('active');
      dropdownMenu.classList.toggle('show');

      // 접근성: aria-expanded 상태 토글
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
      menuToggle.setAttribute('aria-label', isExpanded ? LABEL.open : LABEL.close);
    });

    // 드롭다운 메뉴 외부 클릭 시 메뉴 닫기
    document.addEventListener('click', (event) => {
      const target = event.target as Node;
      const isClickInside = menuToggle.contains(target) || dropdownMenu.contains(target);

      if (!isClickInside && dropdownMenu.classList.contains('show')) {
        menuToggle.classList.remove('active');
        dropdownMenu.classList.remove('show');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', LABEL.open);
      }
    });
  }
});
