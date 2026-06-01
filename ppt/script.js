/* ============================================
   복순도가 TIM504 IMP · 공통 스크립트
   - 스크롤 스냅 트래킹
   - 슬라이드별 reveal
   - 페이지 인디케이터 + 진행 바
   - 키보드 네비게이션
   - Chart.js 초기화
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const progressEl = document.querySelector('.progress-bar .progress');
  const indicatorCurrent = document.querySelector('.slide-indicator .current');
  const indicatorTotal = document.querySelector('.slide-indicator .total');

  if (indicatorTotal) {
    indicatorTotal.textContent = String(slides.length).padStart(2, '0');
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const slide = entry.target;
      if (entry.intersectionRatio >= 0.5) {
        slide.classList.add('in-view');

        const index = Array.from(slides).indexOf(slide);
        const num = index + 1;
        if (indicatorCurrent) indicatorCurrent.textContent = String(num).padStart(2, '0');
        if (progressEl) progressEl.style.width = `${(num / slides.length) * 100}%`;

        // Chart.js trigger
        if (slide.dataset.chart && !slide.dataset.chartInit) {
          initChart(slide.dataset.chart, slide);
          slide.dataset.chartInit = 'true';
        }

        // Three.js activate
        if (slide.dataset.threeScene && window.boksoonThreeScene) {
          window.boksoonThreeScene.activate();
        }
      } else {
        if (slide.dataset.threeScene && window.boksoonThreeScene) {
          window.boksoonThreeScene.deactivate();
        }
      }
    });
  }, { threshold: [0, 0.5, 1] });

  slides.forEach((slide) => observer.observe(slide));

  // 키보드 네비게이션
  let currentIndex = 0;
  const goToSlide = (idx) => {
    if (idx < 0 || idx >= slides.length) return;
    slides[idx].scrollIntoView({ behavior: 'smooth' });
    currentIndex = idx;
  };
  const trackObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.5) {
        currentIndex = Array.from(slides).indexOf(entry.target);
      }
    });
  }, { threshold: 0.5 });
  slides.forEach((slide) => trackObserver.observe(slide));

  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown': case 'ArrowRight': case 'PageDown': case ' ':
        e.preventDefault(); goToSlide(currentIndex + 1); break;
      case 'ArrowUp': case 'ArrowLeft': case 'PageUp':
        e.preventDefault(); goToSlide(currentIndex - 1); break;
      case 'Home': e.preventDefault(); goToSlide(0); break;
      case 'End': e.preventDefault(); goToSlide(slides.length - 1); break;
    }
  });

  // ============================================
  // Chart.js 초기화
  // ============================================
  function initChart(chartId, slide) {
    const canvas = slide.querySelector(`canvas#${chartId}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const commonStyle = {
      font: { family: 'Pretendard', size: 12, weight: '500' },
      legendColor: '#555555',
      gridColor: 'rgba(0,0,0,0.04)',
      tickColor: '#999',
      tooltipBg: '#FFFFFF',
      tooltipTitle: '#1a1a1a',
      tooltipBody: '#555555',
      tooltipBorder: '#8a7544',
    };

    // 재무는 공시 정보가 없어 활동 데이터 기반 정황 차트로 대체
    if (chartId === 'financeChart') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['2012', '2015', '2018', '2021', '2023', '2025', '2026'],
          datasets: [
            {
              type: 'bar',
              label: '신제품 / 라인업 (종)',
              data: [1, 2, 3, 4, 6, 8, 9],
              backgroundColor: 'rgba(138, 117, 68, 0.35)',
              borderColor: '#8a7544',
              borderWidth: 1, borderRadius: 2, order: 2,
            },
            {
              type: 'line',
              label: 'KTX 직영 매장 (개)',
              data: [0, 0, 1, 3, 5, 7, 7],
              borderColor: '#1a1a1a',
              backgroundColor: 'rgba(26,26,26,0.05)',
              borderWidth: 2, tension: 0.4,
              pointBackgroundColor: '#1a1a1a',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 2, pointRadius: 5,
              yAxisID: 'y1', order: 1,
            },
          ],
        },
        options: chartOpts(commonStyle, { rightAxis: true, yUnit: ' 종', y1Unit: ' 개' }),
      });
    }

    // 막걸리 시장 추이
    if (chartId === 'marketChart') {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
          datasets: [
            {
              label: '국내 막걸리 소매시장 (억원)',
              data: [3000, 3500, 4000, 4500, 5000, 5200, 4900, 4720],
              borderColor: '#8a7544',
              backgroundColor: 'rgba(138, 117, 68, 0.10)',
              borderWidth: 2, tension: 0.35,
              pointBackgroundColor: '#8a7544',
              pointRadius: 4, fill: true,
            },
            {
              label: '전통주 출고금액 지수 (2020=100)',
              data: [null, null, null, null, 100, 135, 195, 235],
              borderColor: '#1a1a1a',
              backgroundColor: 'transparent',
              borderWidth: 2, borderDash: [4,3], tension: 0.35,
              pointBackgroundColor: '#1a1a1a',
              pointRadius: 4, yAxisID: 'y1',
            },
          ],
        },
        options: chartOpts(commonStyle, { rightAxis: true, yUnit: ' 억', y1Unit: '' }),
      });
    }

    // 글로벌 막걸리 시장
    if (chartId === 'globalChart') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['2024', '2025', '2026', '2027', '2028', '2029', '2030', '2031', '2032'],
          datasets: [{
            label: '글로벌 막걸리 시장 (USD M)',
            data: [659, 711, 766, 826, 890, 959, 1034, 1115, 1202],
            backgroundColor: 'rgba(138, 117, 68, 0.5)',
            borderColor: '#8a7544', borderWidth: 1, borderRadius: 2,
          }],
        },
        options: chartOpts(commonStyle, { yUnit: ' M$' }),
      });
    }

    // 채널 매출 추정 도넛
    if (chartId === 'channelChart') {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['자사몰 D2C', 'KTX 직영 + 백화점', '해외 수출', '호레카(HORECA)'],
          datasets: [{
            data: [35, 40, 15, 10],
            backgroundColor: ['#8a7544', '#c2a878', '#a8845a', '#E5E1D8'],
            borderColor: '#FFFFFF', borderWidth: 3,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1800, easing: 'easeOutQuart' },
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#555', font: commonStyle.font,
                padding: 16, boxWidth: 14, usePointStyle: true,
              },
            },
            tooltip: chartTooltip(commonStyle),
          },
          cutout: '55%',
        },
      });
    }
  }

  function chartTooltip(s) {
    return {
      backgroundColor: s.tooltipBg, titleColor: s.tooltipTitle,
      bodyColor: s.tooltipBody, borderColor: s.tooltipBorder,
      borderWidth: 1, padding: 12,
      titleFont: { family: 'Pretendard', size: 13, weight: '700' },
      bodyFont: { family: 'Pretendard', size: 12 },
    };
  }

  function chartOpts(s, opt = {}) {
    const scales = {
      x: {
        grid: { color: s.gridColor, drawBorder: false },
        ticks: { color: s.tickColor, font: { family: 'Pretendard', size: 11 } },
      },
      y: {
        grid: { color: s.gridColor, drawBorder: false },
        ticks: {
          color: s.tickColor, font: { family: 'Pretendard', size: 11 },
          callback: (v) => opt.yUnit ? v + opt.yUnit : v,
        },
      },
    };
    if (opt.rightAxis) {
      scales.y1 = {
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: {
          color: s.tickColor, font: { family: 'Pretendard', size: 11 },
          callback: (v) => v + (opt.y1Unit || ''),
        },
      };
    }
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1800, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          position: 'top', align: 'end',
          labels: {
            color: s.legendColor, font: s.font,
            padding: 16, boxWidth: 12, usePointStyle: true,
          },
        },
        tooltip: chartTooltip(s),
      },
      scales,
    };
  }

  // 첫 슬라이드 활성화
  setTimeout(() => slides[0] && slides[0].classList.add('in-view'), 100);

  // ============================================
  // Print 대비: 모든 차트·3D를 즉시 활성화
  // ============================================
  function initAllChartsImmediate() {
    document.querySelectorAll('[data-chart]').forEach((slide) => {
      if (!slide.dataset.chartInit) {
        initChart(slide.dataset.chart, slide);
        slide.dataset.chartInit = 'true';
      }
    });
    if (window.boksoonThreeScene) {
      window.boksoonThreeScene.activate();
    }
    // 모든 슬라이드 in-view 처리
    document.querySelectorAll('.slide').forEach((s) => s.classList.add('in-view'));
  }

  // Chrome headless (print-to-pdf) 환경 감지 → 즉시 모든 차트 init
  if (navigator.userAgent.includes('HeadlessChrome') ||
      navigator.userAgent.includes('Headless') ||
      window.location.search.includes('print')) {
    setTimeout(initAllChartsImmediate, 200);
  }

  // 브라우저 인쇄 (Ctrl+P) 직전에도 활성화
  window.addEventListener('beforeprint', initAllChartsImmediate);
});
