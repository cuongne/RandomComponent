import { ButtonBase, IconButton } from '@material-ui/core';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';
import styles from './styles.module.css';

const objStyle = {
  right: styles.right,
  left: styles.left,
  top: styles.top,
  'top-sticky': styles.top,
  bottom: styles.bottom,
};

const ARROW_WIDTH = 15;
const SCROLL_BAR_WIDTH = 17;
const TourIntro = ({ steps = [], defaultStep = 0, isReady = false, onFinish, mobile }) => {
  const [stepActive, setStepActive] = useState(defaultStep);
  const [styleInline, setStyleInline] = useState({});
  const [tourStep, setTourStep] = useState([]);
  const refTooltip = useRef();
  useEffect(() =>{
    const revertStep = steps.filter(x =>x?.refCurrent.current)
    setTourStep(revertStep)
  },[steps])
  const isDivOutsideView = (refCurrent) => {
    // Get the scroll position of the window.
    const scrollPosition = window.scrollY;

    // Get the height of the window.
    const windowHeight = window.innerHeight;

    // Get the top position of the div.
    const divTop = refCurrent.offsetTop;

    // Check if the div is outside of the view page.
    return divTop < scrollPosition || divTop + refCurrent.offsetHeight > scrollPosition + windowHeight;
  };
  const isToolTipOutsideView = (refCurrent, tooltipRef) => {
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;
    const divTop = refCurrent.offsetTop + tooltipRef.height;
    return divTop < scrollPosition || divTop + refCurrent.offsetHeight > scrollPosition + windowHeight;
  };
  function scrollTo(refCurrent) {
    // Get the document's scroll position.
    const scrollToView = refCurrent.bottom - window.scrollY - window.innerHeight / 2;
    window.scrollTo({ top: scrollToView, behavior: 'smooth' });
    return scrollToView;
  }
  function scrollToMiddle(refCurrent) {
    const scrollToView = refCurrent.bottom - refCurrent.width + window.scrollY;
    window.scrollTo({ top: scrollToView, behavior: 'smooth' });
    return scrollToView;
  }

  const magicTour = (step) => {
    if (step > tourStep.length - 1) {
      return null;
    }
    const getStep = tourStep[step];
    const refInstance =getStep?.refCurrent?.current
    if (getStep && refInstance) {
      refTooltip.current.classList.add(styles.animationToolTip);
      switch (getStep.position) {
        case 'right': {
          if (refInstance) {
            refInstance.classList.add(styles?.activeTour);
            // refInstance.scrollIntoView({ behavior: 'smooth' })
            const divRect = refInstance.getBoundingClientRect();
            if (isDivOutsideView(refInstance)) {
              const scrollToY = scrollTo(divRect);
              setStyleInline(() => ({
                top: scrollToY < 0 ? `${window.scrollY + divRect?.y + 10}px` : `${divRect?.y + ARROW_WIDTH - scrollToY}px`,
                left: `${divRect?.x + divRect.width + SCROLL_BAR_WIDTH}px`,
              }));
            } else {
              setStyleInline(() => ({
                top: `${divRect?.y + ARROW_WIDTH}px`,
                left: `${divRect?.x + divRect.width + SCROLL_BAR_WIDTH}px`,
              }));
            }
          }
          break;
        }
        case 'left': {
          if (refInstance) {
            refInstance.classList.add(styles?.activeTour);
            // refInstance.scrollIntoView({ behavior: 'smooth' })
            const divRect = refInstance.getBoundingClientRect();
            const toolTipWidth = refTooltip.current.getBoundingClientRect();

            if (isDivOutsideView(refInstance)) {
              const scrollToY = scrollTo(divRect);
              setStyleInline(() => ({
                top: scrollToY < 0 ? `${divRect?.y + window.scrollY + 10}px` : `${divRect?.y - scrollToY + 15}px`,
                left: `${divRect?.left - toolTipWidth.width - SCROLL_BAR_WIDTH}px`,
              }));
            } else {
              setStyleInline(() => ({
                top: `${divRect?.y + 15}px`,
                left: `${divRect?.left - toolTipWidth.width - SCROLL_BAR_WIDTH}px`,
              }));
            }
          }
          break;
        }
        case 'bottom': {
          if (refInstance) {
            refInstance.classList.add(styles?.activeTour);
            // refInstance.scrollIntoView({ behavior: 'smooth' })
            const divRect = refInstance.getBoundingClientRect();
            const toolTipWidth = refTooltip.current.getBoundingClientRect();
            if (isDivOutsideView(refInstance)) {
              const pageY = scrollToMiddle(divRect);
              setStyleInline(() => ({
                top: `${divRect?.bottom - pageY + window.scrollY + ARROW_WIDTH}px`,
                right: (window.screen.width - toolTipWidth.width) / 2,
              }));
            } else if (isToolTipOutsideView(refInstance, toolTipWidth)) {
              const pageY = scrollToMiddle(divRect);
              setStyleInline(() => ({
                top: `${divRect?.bottom - pageY + window.scrollY + ARROW_WIDTH}px`,
                right: (window.screen.width - toolTipWidth.width) / 2,
              }));
            } else {
              setStyleInline(() => ({
                top: `${divRect?.bottom + ARROW_WIDTH}px`,
                right: (window.screen.width - toolTipWidth.width) / 2,
              }));
            }
          }
          break;
        }
        case 'top': {
          if (refInstance) {
            refInstance.classList.add(styles?.activeTour);
            const divRect = refInstance.getBoundingClientRect();
            const toolTipWidth = refTooltip.current.getBoundingClientRect();
            if (isDivOutsideView(refInstance)) {
              const pageY = scrollToMiddle(divRect);
              setStyleInline(() => ({
                top: `${divRect?.bottom - pageY + window.scrollY + ARROW_WIDTH}px`,
                right: (window.screen.width - toolTipWidth.width) / 2,
              }));
            } else {
              setStyleInline(() => ({
                top: `${divRect?.bottom + ARROW_WIDTH}px`,
                right: (window.screen.width - toolTipWidth.width) / 2,
              }));
            }
          }
          break;
        }
        case 'top-sticky': {
          if (refInstance) {
            refInstance.classList.add(styles?.activeTour);
            const toolTipWidth = refTooltip.current.getBoundingClientRect();
            setStyleInline(() => ({
              bottom: `120px`,
              right: (window.screen.width - toolTipWidth.width) / 2,
            }));
          }
          break;
        }
        default:
          break;
      }
    } else {
      setStepActive((prev) => prev + 1);
      magicTour(step + 1);
    }
    return null;
  };
  const removeMagicTour = (step) => {
    const refInstance = tourStep[step]?.refCurrent;
    if (refInstance?.current) {
      refInstance.current.classList.remove(styles?.activeTour);
    }
  };
  const closeTour = () => {
    removeMagicTour(stepActive);
    onFinish();
  };
  const handleNext = () => {
    if (stepActive === tourStep.length - 1) {
      localStorage.setItem('stepProductDetail', JSON.stringify({ isFinish: true }));
      onFinish();
      removeMagicTour(stepActive);
    } else {
      setStepActive((prev) => prev + 1);
      removeMagicTour(stepActive);
      magicTour(stepActive + 1);
    }
  };
  const handleBack = () => {
    setStepActive((prev) => prev - 1);
    removeMagicTour(stepActive);
    magicTour(stepActive - 1);
  };
  useEffect(() => {
    if (isReady) {
      magicTour(defaultStep);
    }
  }, [isReady]);
  useLayoutEffect(() => {
    document.body.style.overflow = 'hidden';
    if (!mobile) {
      document.body.style.paddingRight = '17px';
    }
  }, []);

  if (!isReady || tourStep.length === 0) return null;
  return createPortal(
    <div className={styles.portalContainer}>
      <IconButton aria-label="close" className={styles.closeButton} onClick={closeTour}>
        <CloseIcon color="action" />
        <span className={styles.closeText}>Thoát</span>
      </IconButton>
      <div className={clsx(objStyle[tourStep[stepActive].position])} style={styleInline} ref={refTooltip}>
        <div>{tourStep[stepActive].context}</div>

        <div className={styles.footer}>
          <span className={styles.stepActive}>
            {stepActive + 1}/{tourStep?.length}
          </span>
          <div className={styles.groupButton}>
            {stepActive > 0 && (
              <ButtonBase className={styles.back} onClick={handleBack}>
                Quay lại
              </ButtonBase>
            )}
            <ButtonBase className={styles.next} onClick={handleNext}>
              {stepActive === tourStep.length - 1 ? 'Tôi đã hiểu' : 'Tiếp theo'}
            </ButtonBase>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TourIntro;
