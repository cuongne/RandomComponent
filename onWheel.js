 const handleWheel = (event) => {
 
    if (focused) {
      divRef?.current.scrollBy({
        left: event.deltaY < 0 ? -30 : 30,
      });
    }
  };
  const handleBlur = () => {
    setFocused(false);
    document.body.style.paddingRight = '';
    document.body.style.overflowY = 'auto';
  };
  const handleFocus = () => {
    const canScroll = divRef?.current?.scrollWidth > divRef?.current?.clientWidth;
    const scrollbarWidth = window.innerWidth - document.body.clientWidth;

    if (canScroll) {
      document.body.style.overflowY = 'hidden';
      if(scrollbarWidth > 0){
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
      setFocused(true);
    }
  };
