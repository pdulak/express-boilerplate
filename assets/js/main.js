// Highlight the current page in the navigation bar
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        if (window.location.href.includes(link.href) && !link.classList.contains('the-home')) {
            link.classList.add('active');
        }
    });
});