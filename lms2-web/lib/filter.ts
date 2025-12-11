export const filter = {
  showFilter: () => {
    const filter = document.getElementById('loading-filter');
    if (filter !== undefined && filter !== null) filter.style.display = 'flex';
  },
  hideFilter: () => {
    const filter = document.getElementById('loading-filter');
    if (filter !== undefined && filter !== null) filter.style.display = 'none';
  }
};
