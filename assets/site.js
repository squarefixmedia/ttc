(function(){
  var still = !document.documentElement.classList.contains('motion');
  var $ = function(s,root){ return [].slice.call((root||document).querySelectorAll(s)); };

  /* scroll motion: parallax, sliding headline lines, tilting card, ticker rows, pinned photo reel, call-sheet progress */
  if(!still){
    var par=$('[data-par]'), shift=$('[data-shift]'), rows=$('[data-scrollx]'), tilt=$('[data-tilt]'),
        hero=document.querySelector('.hero,.page-hero'), sheet=document.getElementById('sheet'), steps=$('.step'),
        pin=document.getElementById('roompin'), reel=document.getElementById('reel'), wide=matchMedia('(min-width:900px)'), ticking=false;
    var frame=function(){
      ticking=false; var vh=innerHeight;
      par.forEach(function(el){ var r=el.getBoundingClientRect(); if(r.bottom<-200||r.top>vh+200) return;
        var c=(r.top+r.height/2-vh/2); el.style.transform='translate3d(0,'+(c*parseFloat(el.getAttribute('data-par'))).toFixed(1)+'px,0)'; });
      var hp=hero?Math.min(1,Math.max(0,-hero.getBoundingClientRect().top/hero.offsetHeight)):0;
      shift.forEach(function(el){ el.style.transform='translate3d('+(hp*140*parseFloat(el.getAttribute('data-shift'))).toFixed(1)+'px,0,0)'; });
      tilt.forEach(function(el){ el.style.setProperty('--tilt',(-6+hp*14).toFixed(2)+'deg'); });
      rows.forEach(function(el){ var r=el.getBoundingClientRect(); var p=(vh-r.top)/(vh+r.height); el.style.transform='translate3d('+((p-.5)*40*parseFloat(el.getAttribute('data-scrollx'))).toFixed(2)+'%,0,0)'; });
      if(pin&&reel){
        if(wide.matches){ var pr=pin.getBoundingClientRect(); var total=pin.offsetHeight-vh; var p=Math.min(1,Math.max(0,-pr.top/Math.max(1,total)));
          var max=reel.scrollWidth-document.documentElement.clientWidth; reel.style.transform='translate3d('+(-p*Math.max(0,max)).toFixed(1)+'px,0,0)'; }
        else reel.style.transform='';
      }
      if(sheet){ var s=sheet.getBoundingClientRect(); var q=Math.min(1,Math.max(0,(vh*.6-s.top)/s.height)); sheet.style.setProperty('--p',q.toFixed(3));
        steps.forEach(function(st){ st.classList.toggle('done', st.getBoundingClientRect().top < vh*.6); }); }
    };
    var req=function(){ if(!ticking){ ticking=true; requestAnimationFrame(frame); } };
    addEventListener('scroll',req,{passive:true}); addEventListener('resize',req); frame();
  } else {
    $('.step').forEach(function(st){ st.classList.add('done'); });
  }

  /* animation switch, shown only to visitors whose device asks for reduced motion */
  var mt=document.querySelector('.motion-toggle');
  if(mt && matchMedia('(prefers-reduced-motion: reduce)').matches){
    mt.hidden=false; mt.textContent=still?'Play animations':'Pause animations';
    mt.addEventListener('click',function(){ try{ localStorage.setItem('ttc-motion',still?'on':'off'); }catch(e){} location.reload(); });
  }

  /* copy buttons */
  var sel=function(b){ var el=b.previousElementSibling; if(!el) return; var r=document.createRange(); r.selectNodeContents(el); var s=getSelection(); s.removeAllRanges(); s.addRange(r); };
  $('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var v=b.getAttribute('data-copy'), o=b.textContent, done=function(){ b.textContent='Copied'; setTimeout(function(){b.textContent=o},1400); };
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(v).then(done,function(){sel(b)}); } else { sel(b); }
    });
  });

  /* mobile menu closes after a tap */
  $('.menu-panel a').forEach(function(a){ a.addEventListener('click',function(){ a.closest('details').open=false; }); });

  /* work filters */
  var filters=$('.filter');
  if(filters.length){
    var cards=$('.wcard'), empty=document.getElementById('filter-empty');
    filters.forEach(function(f){ f.addEventListener('click',function(){
      var k=f.getAttribute('data-filter'), shown=0;
      filters.forEach(function(x){ x.setAttribute('aria-pressed', x===f?'true':'false'); });
      cards.forEach(function(c){ var on=k==='all'||(' '+c.getAttribute('data-cats')+' ').indexOf(' '+k+' ')>-1; c.hidden=!on; if(on) shown++; });
      if(empty) empty.hidden=shown>0;
    }); });
  }

  /* contact: brand / creative switch */
  var tabs=$('[data-door]');
  if(tabs.length){
    var show=function(name,focus){
      tabs.forEach(function(t){ var on=t.getAttribute('data-door')===name; t.setAttribute('aria-selected',on?'true':'false'); t.tabIndex=on?0:-1;
        document.getElementById('panel-'+t.getAttribute('data-door')).hidden=!on; if(on&&focus) t.focus(); });
    };
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){ show(t.getAttribute('data-door')); });
      t.addEventListener('keydown',function(e){ if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ e.preventDefault(); var n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length]; show(n.getAttribute('data-door'),true); } });
    });
    if(location.hash==='#creatives') show('creatives');
    addEventListener('hashchange',function(){ if(location.hash==='#creatives') show('creatives'); if(location.hash==='#brands') show('brands'); });
  }

  /* forms: check the required fields, then open a ready-to-send email to the studio */
  $('form[data-mailto]').forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault(); var bad=null;
      $('[required]',form).forEach(function(el){ var ok=el.value.trim()!==''&&(!el.checkValidity||el.checkValidity()); el.setAttribute('aria-invalid',ok?'false':'true'); if(!ok&&!bad) bad=el; });
      if(bad){ bad.focus(); return; }
      var lines=[], seen={};
      $('input,textarea',form).forEach(function(el){
        if(!el.name) return;
        if(el.type==='checkbox'){ if(!el.checked) return; seen[el.name]=(seen[el.name]?seen[el.name]+', ':'')+el.value; return; }
        if(el.value.trim()) lines.push(el.getAttribute('data-label')+': '+el.value.trim());
      });
      Object.keys(seen).forEach(function(k){ lines.push(form.querySelector('[name="'+k+'"]').getAttribute('data-label')+': '+seen[k]); });
      var href='mailto:geetkumar@twitchythought.com?subject='+encodeURIComponent(form.getAttribute('data-subject'))+'&body='+encodeURIComponent(lines.join('\n'));
      location.href=href;
      var t=document.getElementById(form.getAttribute('data-thanks')); if(t){ form.hidden=true; t.hidden=false; t.focus(); }
    });
  });
  $('[data-reset]').forEach(function(b){ b.addEventListener('click',function(){ var f=document.getElementById(b.getAttribute('data-reset')); f.reset(); f.hidden=false; b.closest('.thanks').hidden=true; f.querySelector('input').focus(); }); });
})();
