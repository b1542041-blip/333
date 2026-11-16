/* 太陽系模擬器互動：建立星空、控制速度，並顯示行星資料。 */
const planetFacts={
  mercury:{name:'水星',english:'MERCURY',fact:'最靠近太陽，也是太陽系中最小的行星。',period:'88 天',distance:'0.39 AU（約 5,790 萬公里）'},
  venus:{name:'金星',english:'VENUS',fact:'濃密的大氣讓它成為太陽系中最熱的行星。',period:'225 天',distance:'0.72 AU（約 1 億 820 萬公里）'},
  earth:{name:'地球',english:'EARTH',fact:'我們的家園，也是目前已知唯一孕育生命的星球。',period:'365 天',distance:'1.00 AU（約 1 億 4,960 萬公里）'},
  mars:{name:'火星',english:'MARS',fact:'因表面的氧化鐵而呈紅色，擁有太陽系最高的火山。',period:'687 天',distance:'1.52 AU（約 2 億 2,790 萬公里）'},
  jupiter:{name:'木星',english:'JUPITER',fact:'太陽系最大的行星，著名的大紅斑是一場巨大風暴。',period:'11.86 年',distance:'5.20 AU（約 7 億 7,850 萬公里）'},
  saturn:{name:'土星',english:'SATURN',fact:'以壯觀的冰塵環聞名，是一顆氣體巨行星。',period:'29.45 年',distance:'9.58 AU（約 14 億 3,350 萬公里）'},
  uranus:{name:'天王星',english:'URANUS',fact:'自轉軸幾乎側躺，呈現獨特的藍綠色。',period:'84.02 年',distance:'19.2 AU（約 28 億 7,250 萬公里）'},
  neptune:{name:'海王星',english:'NEPTUNE',fact:'最遠的行星，深藍色大氣中有強勁高速的風。',period:'164.8 年',distance:'30.05 AU（約 44 億 9,510 萬公里）'}
};

const starField=document.querySelector('#star-field');
const random=(min,max)=>Math.random()*(max-min)+min;
// 以隨機位置與亮度點綴深色太空背景。
for(let index=0;index<100;index++){
  const star=document.createElement('i');
  star.className='star';
  const size=random(1,2.4);
  star.style.cssText=`left:${random(1,99)}%;top:${random(1,99)}%;width:${size}px;height:${size}px;--twinkle:${random(2,5)}s;--drift-duration:${random(9,24)}s;--drift-x:${random(-22,22)}px;--drift-y:${random(-18,18)}px;animation-delay:-${random(0,5)}s;opacity:${random(.25,.8)}`;
  starField.append(star);
}

const speedControl=document.querySelector('#speed-control');
const speedValue=document.querySelector('#speed-value');
const pauseButton=document.querySelector('#pause-button');
const pauseLabel=document.querySelector('#pause-label');
const resetButton=document.querySelector('#reset-button');
const orbits=[...document.querySelectorAll('.orbit')];
const planetDetail=document.querySelector('#planet-detail');
const tooltip=document.querySelector('#planet-tooltip');
const scene=document.querySelector('#space-scene');
const initialDetail=planetDetail.innerHTML;
let paused=false;

// 依照滑桿倍率更新軌道速度；CSS 動畫時間縮短時，公轉速度會加快。
function updateSpeed(){
  const speed=Number(speedControl.value);
  speedValue.textContent=`${speed.toFixed(1)}×`;
  const progress=((speed-.1)/(5-.1))*100;
  speedControl.style.background=`linear-gradient(to right,#a991fa ${progress}%,#373b50 ${progress}%)`;
  orbits.forEach(orbit=>{
    const baseDuration=Number.parseFloat(getComputedStyle(orbit).getPropertyValue('--duration'));
    orbit.style.animationDuration=`${baseDuration/speed}s`;
    orbit.style.animationPlayState=paused?'paused':'running';
  });
}
speedControl.addEventListener('input',updateSpeed);

// 按鈕切換公轉暫停狀態，速度設定會保留。
pauseButton.addEventListener('click',()=>{
  paused=!paused;
  pauseButton.setAttribute('aria-pressed',String(paused));
  pauseLabel.textContent=paused?'繼續公轉':'暫停公轉';
  pauseButton.querySelector('.pause-symbol').textContent=paused?'▶':'Ⅱ';
  updateSpeed();
});

// 點選圖鑑或軌道上的行星，顯示名稱、簡介、公轉週期與平均日距。
function selectPlanet(id){
  const fact=planetFacts[id];
  if(!fact)return;
  document.querySelectorAll('.planet-card').forEach(card=>card.classList.toggle('active',card.dataset.planet===id));
  document.querySelectorAll('.planet').forEach(planet=>planet.classList.toggle('selected',planet.classList.contains(id)));
  planetDetail.classList.add('has-info');
  planetDetail.innerHTML=`<div><span class="detail-name">${fact.name} · ${fact.english}</span><span class="detail-description">${fact.fact}</span><span class="detail-stat"><b>公轉週期</b>${fact.period}</span><span class="detail-stat"><b>與太陽距離</b>${fact.distance}</span></div>`;
}
document.querySelectorAll('.planet-card').forEach(card=>card.addEventListener('click',()=>selectPlanet(card.dataset.planet)));
document.querySelectorAll('.planet').forEach(planet=>{
  planet.addEventListener('click',()=>selectPlanet(planet.classList[1]));
  planet.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectPlanet(planet.classList[1]);}});
  planet.addEventListener('pointerenter',()=>{
    const sceneRect=scene.getBoundingClientRect();
    const planetRect=planet.getBoundingClientRect();
    tooltip.textContent=planet.dataset.name;
    tooltip.style.left=`${planetRect.left-sceneRect.left+planetRect.width/2}px`;
    tooltip.style.top=`${planetRect.top-sceneRect.top-27}px`;
    tooltip.classList.add('visible');
  });
  // 行星持續公轉時，提示框跟著游標更新，避免停留在舊位置。
  planet.addEventListener('pointermove',event=>{
    const sceneRect=scene.getBoundingClientRect();
    tooltip.style.left=`${event.clientX-sceneRect.left+12}px`;
    tooltip.style.top=`${event.clientY-sceneRect.top-34}px`;
  });
  planet.addEventListener('pointerleave',()=>tooltip.classList.remove('visible'));
});

// 重設速度、播放狀態與行星選取，回到頁面初始設定。
resetButton.addEventListener('click',()=>{
  speedControl.value='1';
  paused=false;
  pauseButton.setAttribute('aria-pressed','false');
  pauseLabel.textContent='暫停公轉';
  pauseButton.querySelector('.pause-symbol').textContent='Ⅱ';
  document.querySelectorAll('.planet-card,.planet').forEach(item=>item.classList.remove('active','selected'));
  planetDetail.classList.remove('has-info');
  planetDetail.innerHTML=initialDetail;
  updateSpeed();
});
updateSpeed();
