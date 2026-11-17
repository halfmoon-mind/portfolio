document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle') as HTMLButtonElement | null;
  const dropdownMenu = document.getElementById('dropdown-menu') as HTMLDivElement | null;

  if (menuToggle && dropdownMenu) {
    // Localise the dynamic aria-label off the header's locale (not <html lang>).
    const en = menuToggle.dataset.menuLocale === 'en';
    const LABEL = {
      open: en ? 'Open menu' : '메뉴 열기',
      close: en ? 'Close menu' : '메뉴 닫기',
    };

    const close = () => {
      menuToggle.classList.remove('active');
      dropdownMenu.classList.remove('show');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', LABEL.open);
    };

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

      if (!isClickInside && dropdownMenu.classList.contains('show')) close();
    });

    // Escape 키로 닫고 포커스를 토글 버튼으로 되돌림
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && dropdownMenu.classList.contains('show')) {
        close();
        menuToggle.focus();
      }
    });
  }
});
