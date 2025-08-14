// app5.js - Collapsible/Expandable Ribbons Toggle
document.addEventListener('DOMContentLoaded', function() {
	// Create the toggle button
	const btn = document.createElement('button');
	btn.id = 'toggle-ribbons-btn';
	btn.className = 'toggle-ribbons-btn';
	btn.title = 'Collapse/Expand ribbons';
	btn.style.position = 'fixed';
	btn.style.top = '18px';
	btn.style.right = '32px';
	btn.style.zIndex = '2001';
	btn.style.marginBottom = '12px';
	btn.innerHTML = '<span id="toggle-ribbons-icon">⬇️</span> Expand Ribbons';
	document.body.appendChild(btn);

	// Helper: get all ribbons (now includes .stats)
	function getRibbons() {
		return document.querySelectorAll('.header, .sticky-search, .controls, .sql-section'); // removed .stats
	}

	// Collapse by default
	let ribbonsCollapsed = true;
	getRibbons().forEach(r => r.classList.add('collapsed-ribbon'));

	btn.addEventListener('click', function() {
		ribbonsCollapsed = !ribbonsCollapsed;
		getRibbons().forEach(r => {
			if (ribbonsCollapsed) {
				r.classList.add('collapsed-ribbon');
			} else {
				r.classList.remove('collapsed-ribbon');
			}
		});
		if (ribbonsCollapsed) {
			btn.innerHTML = '<span id="toggle-ribbons-icon">⬇️</span> Expand Ribbons';
		} else {
			btn.innerHTML = '<span id="toggle-ribbons-icon">⬆️</span> Collapse Ribbons';
		}
	});
});
