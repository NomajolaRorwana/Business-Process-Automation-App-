// main.js — extracted from index.html

// Nav scroll color toggle
(function(){
    const nav = document.getElementById('site-nav');
    function onScroll(){
        if(window.scrollY > 30){
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
    document.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
})();

// Scroll reveal using IntersectionObserver
(function(){
    const obs = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                entry.target.classList.add('in-view');
            }
        });
    },{ threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach((el)=> obs.observe(el));
})();
