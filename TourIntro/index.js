/* eslint-disable no-restricted-syntax */
import { ButtonBase } from '@material-ui/core';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ProgressTour from './ProgressTour';
import styles from './styles.module.css';

const objStyle = {
  right: styles.right,
  left: styles.left,
  top: styles.top,
  'top-sticky': styles.topSticky,
  bottom: styles.bottom,
};

const TourIntro = ({ steps = [], defaultStep = 0, isReady = false, onFinish, name, isHiddenScroll }) => {
  const stepState = JSON.parse(localStorage.getItem(name))?.stepsFinish || [];
  const [stepActive, setStepActive] = useState(defaultStep);
  const [styleInline, setStyleInline] = useState({});
  const [styleInlineArrow, setStyleInlineArrow] = useState({});
  const [widthProgress, setWidthProgress] = useState(310);
  // back not show timelapse
  // const [isShowTimeLine, setIsShowTimeLine] = useState(true);
  const [tourStep, setTourStep] = useState([]);
  const refTooltip = useRef();
  const intervalRef = useRef(null);
  useEffect(() => {
    if (stepState?.length > 0) {
      const revertStep =
        stepState?.length > 0
          ? steps.filter((x) => x?.refCurrent.current && !stepState?.some((data) => data === x?.name))
          : steps.filter((x) => x?.refCurrent.current);
      setTourStep(() => revertStep);
    } else {
      setTourStep(() => {
        const revertStep =  steps.filter((x) => x?.refCurrent.current)
        return revertStep;
      });
    }
  }, [steps]);

  const scrollTo = (refCurrent, position) => {
    const typeBock = {
      bottom: 'center',
      top: 'end',
      left: 'center',
      right: 'center',
    };
    refCurrent.scrollIntoView({
      behavior: 'smooth',
      block: typeBock[position],
    });
  };

  const magicTour = (step) => {
    if (step > tourStep.length - 1) {
      return null;
    }
    const getStep = tourStep[step];
    const refInstance = getStep?.refCurrent?.current;
    if (getStep && refInstance) {
      setWidthProgress((defaultValue) => getStep?.styles?.width || defaultValue);
      refTooltip.current.classList.add(styles.animationToolTip);
      refInstance.classList.add(styles?.activeTour);
      scrollTo(refInstance, getStep.position);
      refInstance.appendChild(refTooltip.current);
      setStyleInline(() => getStep?.styles);
      setStyleInlineArrow(() => getStep?.stylesArrow);
    } else {
      setStepActive((prev) => prev + 1);
      magicTour(step + 1);
    }
    return null;
  };
  const removeMagicTour = (step) => {
    const refInstance = tourStep[step]?.refCurrent;
    refInstance.current.classList.remove(styles?.activeTour);
    refInstance.current.removeChild(refTooltip.current);
  };
  const handleNext = () => {
    if (stepActive === tourStep.length - 1) {
      clearInterval(intervalRef.current);
      if (tourStep.length === steps.length) {
        localStorage.setItem(name, JSON.stringify({ isFinish: true }));
      } else {
        const stepsFinish = tourStep.map((step) => step?.name);
        localStorage.setItem(
          name,
          JSON.stringify({
            isFinish: stepsFinish?.length + stepState?.length === steps.length,
            stepsFinish: [...(stepState || []), ...stepsFinish],
          }),
        );
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onFinish();
      removeMagicTour(stepActive);
    } else {
      setStepActive((prev) => {
        removeMagicTour(prev);
        magicTour(prev + 1);
        return prev + 1;
      });
    }
  };

  const handleBack = (e) => {
    // set hidden timelap
    // setIsShowTimeLine(false);
    e.preventDefault();
    e.stopPropagation();
    setStepActive((prev) => {
      removeMagicTour(prev);
      magicTour(prev - 1);
      return prev - 1;
    });
  };

  const onCallBack = () => {
    setStepActive((prev) => {
      removeMagicTour(prev);
      magicTour(prev + 1);
      return prev + 1;
    });
  };

  useEffect(() => {
    if (isReady) {
      magicTour(defaultStep);
    }
  }, [isReady]);
  useEffect(() => {
    if (isHiddenScroll) {
      const timOut = setTimeout(() => {
        document.body.style.overflow = 'hidden';
      }, 0);
      return () => clearTimeout(timOut);
    }
    return null;
  }, [isHiddenScroll]);

  if (!isReady || tourStep.length === 0) return null;
  return createPortal(
    <div className={styles.portalContainer}>
      <div className={clsx(objStyle[tourStep[stepActive]?.position])} style={styleInline} ref={refTooltip}>
        <span className={styles.modal}>{tourStep[stepActive].context}</span>

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
        {tourStep.length - 1 !== stepActive && (
          <ProgressTour handleCallBack={onCallBack} stepActive={stepActive} tourStep={tourStep} width={widthProgress} />
        )}
        <div className={styles.arrow} style={styleInlineArrow} />
      </div>
    </div>,
    document.body,
  );
};

export default TourIntro;
