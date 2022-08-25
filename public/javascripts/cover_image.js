window.onload = () => {
    document.querySelectorAll('.cover-image').forEach((image) => {
      if (image.naturalWidth === 1 && image.naturalHeight === 1)
        image.src = '/images/default_cover0.jpeg';
    });
  }