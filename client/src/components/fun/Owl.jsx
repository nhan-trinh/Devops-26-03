import React from 'react';
import styled from 'styled-components';

const Owl = () => {
  return (
    <StyledWrapper>
      <div>
        <div className="cloud cloud--1" />
        <div className="cloud cloud--2" />
        <div className="main">
          <div className="owl">
            <div className="owl__head">
              <div className="owl__tuft owl__tuft--left" />
              <div className="owl__tuft owl__tuft--right" />
              <div className="owl__eye owl__eye--left" />
              <div className="owl__eye owl__eye--right" />
              <div className="owl__beak" />
            </div>
            <div className="owl__body" />
            <div className="owl__wing owl__wing--left" />
            <div className="owl__wing owl__wing--right" />
            <div className="owl__foot owl__foot--left" />
            <div className="owl__foot owl__foot--right" />
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .main {
    position: relative;
    width: 30vmax;
    height: 30vmax;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    .main {
      position: relative;
      /* Scaled down from 30vmax */
      width: 15vmax;
      height: 15vmax;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10; /* Ensure owl is in front of clouds */
    }

    .owl {
      position: relative;
      /* Scaled down from 15vmax x 20vmax */
      width: 7.5vmax;
      height: 10vmax;
      animation: float 6s ease-in-out infinite;
    }

    /* Shadow */
    .owl::before {
      content: "";
      position: absolute;
      /* Scaled down */
      bottom: -2vmax;
      left: 50%;
      transform: translateX(-50%);
      width: 9vmax;
      height: 0.75vmax;
      background-color: #00000020;
      border-radius: 50%;
      z-index: -10;
      animation: shadow-bob 6s ease-in-out infinite;
    }

    .owl__body {
      position: absolute;
      /* Scaled down */
      bottom: 1.5vmax;
      left: 50%;
      transform: translateX(-50%);
      width: 7vmax;
      height: 7vmax;
      background-color: #8c6d52;
      border-radius: 50% 50% 45% 45%;
      z-index: 2;
    }

    /* Tummy Patch */
    .owl__body::before {
      content: "";
      position: absolute;
      /* Scaled down */
      bottom: 0.25vmax;
      left: 50%;
      transform: translateX(-50%);
      width: 4.5vmax;
      height: 4vmax;
      background-color: #c9b7a8;
      border-radius: 50% 50% 40% 40%;
    }

    /* Feather Pattern on tummy */
    .owl__body::after {
      content: "v v v";
      position: absolute;
      /* Scaled down */
      bottom: 1.5vmax;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.75vmax;
      font-weight: bold;
      color: #8c6d5299;
      font-family: "Courier New", Courier, monospace;
      line-height: 0.8;
      letter-spacing: 0.25vmax;
    }

    .owl__head {
      position: absolute;
      top: 0;
      left: 50%;
      transform-origin: bottom center;
      /* Scaled down */
      width: 7.5vmax;
      height: 6.5vmax;
      background-color: #a58467;
      border-radius: 50%;
      z-index: 3;
      animation: head-tilt 6s ease-in-out infinite;
    }

    /* Ear Tufts */
    .owl__tuft {
      position: absolute;
      /* Scaled down */
      top: -0.5vmax;
      width: 1.5vmax;
      height: 2vmax;
      background-color: #8c6d52;
      z-index: -1;
      animation: tuft-wiggle 6s ease-in-out infinite;
    }
    .owl__tuft--left {
      left: 0.5vmax; /* Scaled down */
      border-radius: 70% 30% 0 0;
      transform: rotate(-10deg);
    }
    .owl__tuft--right {
      right: 0.5vmax; /* Scaled down */
      border-radius: 30% 70% 0 0;
      transform: rotate(10deg);
      animation-delay: -0.2s;
    }

    .owl__eye {
      position: absolute;
      /* Scaled down */
      top: 1.25vmax;
      width: 2.5vmax;
      height: 2.5vmax;
      background-color: #fff;
      border-radius: 50%;
      border: 0.25vmax solid #8c6d52;
      overflow: hidden;
      animation: blink 6s linear infinite;
    }

    /* Pupil */
    .owl__eye::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      /* Scaled down */
      width: 1.25vmax;
      height: 1.25vmax;
      background-color: #2c2c2c;
      border-radius: 50%;
      animation: pupil-move 6s ease-in-out infinite;
    }

    .owl__eye--left {
      left: 0.75vmax; /* Scaled down */
    }

    .owl__eye--right {
      right: 0.75vmax; /* Scaled down */
    }

    .owl__beak {
      position: absolute;
      /* Scaled down */
      top: 3.5vmax;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 0.75vmax solid transparent;
      border-right: 0.75vmax solid transparent;
      border-top: 1vmax solid #f2b705;
    }

    .owl__wing {
      position: absolute;
      /* Scaled down */
      top: 2.5vmax;
      width: 4vmax;
      height: 6vmax;
      background-color: #a58467;
      border-radius: 80% 10% 80% 10%;
      z-index: 1;
    }

    .owl__wing--left {
      left: -1vmax; /* Scaled down */
      transform-origin: top right;
      animation: flap-left 6s ease-in-out infinite;
    }

    .owl__wing--right {
      right: -1vmax; /* Scaled down */
      transform-origin: top left;
      border-radius: 10% 80% 10% 80%;
      animation: flap-right 6s ease-in-out infinite;
    }

    .owl__foot {
      position: absolute;
      /* Scaled down */
      bottom: 1vmax;
      width: 1vmax;
      height: 0.75vmax;
      background-color: #f2b705;
      border-radius: 40% 40% 50% 50%;
      z-index: 4;
      animation: dangle 3s ease-in-out infinite;
    }

    .owl__foot--left {
      left: 2vmax; /* Scaled down */
    }
    .owl__foot--right {
      right: 2vmax; /* Scaled down */
      animation-delay: -1.5s;
    }

    /* Cloud styling */
    .cloud {
      position: absolute;
      /* Scaled down */
      width: 7.5vmax;
      height: 2.5vmax;
      background-color: #ffffff;
      border-radius: 2.5vmax;
      opacity: 0.8;
      animation: cloud-drift linear infinite;
    }
    .cloud::before,
    .cloud::after {
      content: "";
      position: absolute;
      background-color: #ffffff;
      border-radius: 50%;
    }
    .cloud::before {
      /* Scaled down */
      width: 4vmax;
      height: 4vmax;
      top: -2vmax;
      left: 1vmax;
    }
    .cloud::after {
      /* Scaled down */
      width: 3vmax;
      height: 3vmax;
      top: -1vmax;
      right: 0.5vmax;
    }
    .cloud--1 {
      top: 20%;
      animation-duration: 40s;
    }
    .cloud--2 {
      top: 50%;
      transform: scale(0.7);
      animation-duration: 60s;
      animation-delay: -20s;
    }

    /*==============================*/
    /*       Keyframe Animations    */
    /*==============================*/
    @keyframes float {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        /* Scaled down from -4vmax */
        transform: translateY(-2vmax);
      }
    }

    @keyframes shadow-bob {
      0%,
      100% {
        transform: translateX(-50%) scale(1);
        opacity: 1;
      }
      50% {
        transform: translateX(-50%) scale(0.7);
        opacity: 0.5;
      }
    }

    @keyframes flap-left {
      0%,
      100% {
        transform: rotate(10deg);
      }
      50% {
        transform: rotate(-25deg);
      }
    }

    @keyframes flap-right {
      0%,
      100% {
        transform: rotate(-10deg);
      }
      50% {
        transform: rotate(25deg);
      }
    }

    @keyframes blink {
      0%,
      93%,
      96%,
      100% {
        transform: scaleY(1);
      }
      95% {
        transform: scaleY(0.1);
      }
    }

    @keyframes pupil-move {
      0%,
      30% {
        transform: translate(-50%, -50%);
      } /* Center */
      40%,
      60% {
        transform: translate(-80%, -50%);
      } /* Left */
      70%,
      90% {
        transform: translate(-20%, -50%);
      } /* Right */
      100% {
        transform: translate(-50%, -50%);
      } /* Center */
    }

    @keyframes dangle {
      0%,
      100% {
        transform: rotate(5deg);
      }
      50% {
        transform: rotate(-10deg);
      }
    }

    @keyframes head-tilt {
      0%,
      100% {
        transform: translateX(-50%) rotate(0deg);
      }
      20%,
      30% {
        transform: translateX(-50%) rotate(-8deg);
      }
      70%,
      80% {
        transform: translateX(-50%) rotate(8deg);
      }
    }

    @keyframes tuft-wiggle {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        /* Scaled down from -0.3vmax */
        transform: translateY(-0.15vmax);
      }
    }

    @keyframes cloud-drift {
      from {
        /* Scaled down from -25vmax */
        left: -12.5vmax;
      }
      to {
        left: 110%;
      }
    } /* Ensure owl is in front of clouds */
  }

  .owl {
    position: relative;
    width: 15vmax;
    height: 20vmax;
    animation: float 6s ease-in-out infinite;
  }

  /* Shadow */
  .owl::before {
    content: "";
    position: absolute;
    bottom: -4vmax;
    left: 50%;
    transform: translateX(-50%);
    width: 18vmax;
    height: 1.5vmax;
    background-color: #00000020;
    border-radius: 50%;
    z-index: -10;
    animation: shadow-bob 6s ease-in-out infinite;
  }

  .owl__body {
    position: absolute;
    bottom: 3vmax;
    left: 50%;
    transform: translateX(-50%);
    width: 14vmax;
    height: 14vmax;
    background-color: #8c6d52;
    border-radius: 50% 50% 45% 45%;
    z-index: 2;
  }

  /* Tummy Patch */
  .owl__body::before {
    content: "";
    position: absolute;
    bottom: 0.5vmax;
    left: 50%;
    transform: translateX(-50%);
    width: 9vmax;
    height: 8vmax;
    background-color: #c9b7a8;
    border-radius: 50% 50% 40% 40%;
  }

  /* Feather Pattern on tummy */
  .owl__body::after {
    content: "v v v";
    position: absolute;
    bottom: 3vmax;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.5vmax;
    font-weight: bold;
    color: #8c6d5299;
    font-family: "Courier New", Courier, monospace;
    line-height: 0.8;
    letter-spacing: 0.5vmax;
  }

  .owl__head {
    position: absolute;
    top: 0;
    left: 50%;
    transform-origin: bottom center;
    width: 15vmax;
    height: 13vmax;
    background-color: #a58467;
    border-radius: 50%;
    z-index: 3;
    animation: head-tilt 6s ease-in-out infinite;
  }

  /* Ear Tufts */
  .owl__tuft {
    position: absolute;
    top: -1vmax;
    width: 3vmax;
    height: 4vmax;
    background-color: #8c6d52;
    z-index: -1;
    animation: tuft-wiggle 6s ease-in-out infinite;
  }
  .owl__tuft--left {
    left: 1vmax;
    border-radius: 70% 30% 0 0;
    transform: rotate(-10deg);
  }
  .owl__tuft--right {
    right: 1vmax;
    border-radius: 30% 70% 0 0;
    transform: rotate(10deg);
    animation-delay: -0.2s;
  }

  .owl__eye {
    position: absolute;
    top: 2.5vmax;
    width: 5vmax;
    height: 5vmax;
    background-color: #fff;
    border-radius: 50%;
    border: 0.5vmax solid #8c6d52;
    overflow: hidden;
    animation: blink 6s linear infinite;
  }

  /* Pupil */
  .owl__eye::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2.5vmax;
    height: 2.5vmax;
    background-color: #2c2c2c;
    border-radius: 50%;
    animation: pupil-move 6s ease-in-out infinite;
  }

  .owl__eye--left {
    left: 1.5vmax;
  }

  .owl__eye--right {
    right: 1.5vmax;
  }

  .owl__beak {
    position: absolute;
    top: 7vmax;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 1.5vmax solid transparent;
    border-right: 1.5vmax solid transparent;
    border-top: 2vmax solid #f2b705;
  }

  .owl__wing {
    position: absolute;
    top: 5vmax;
    width: 8vmax;
    height: 12vmax;
    background-color: #a58467;
    border-radius: 80% 10% 80% 10%;
    z-index: 1;
  }

  .owl__wing--left {
    left: -2vmax;
    transform-origin: top right;
    animation: flap-left 6s ease-in-out infinite;
  }

  .owl__wing--right {
    right: -2vmax;
    transform-origin: top left;
    border-radius: 10% 80% 10% 80%;
    animation: flap-right 6s ease-in-out infinite;
  }

  .owl__foot {
    position: absolute;
    bottom: 2vmax;
    width: 2vmax;
    height: 1.5vmax;
    background-color: #f2b705;
    border-radius: 40% 40% 50% 50%;
    z-index: 4;
    animation: dangle 3s ease-in-out infinite;
  }

  .owl__foot--left {
    left: 4vmax;
  }
  .owl__foot--right {
    right: 4vmax;
    animation-delay: -1.5s;
  }

  /* Cloud styling */
  .cloud {
    position: absolute;
    width: 15vmax;
    height: 5vmax;
    background-color: #ffffff;
    border-radius: 5vmax;
    opacity: 0.8;
    animation: cloud-drift linear infinite;
  }
  .cloud::before,
  .cloud::after {
    content: "";
    position: absolute;
    background-color: #ffffff;
    border-radius: 50%;
  }
  .cloud::before {
    width: 8vmax;
    height: 8vmax;
    top: -4vmax;
    left: 2vmax;
  }
  .cloud::after {
    width: 6vmax;
    height: 6vmax;
    top: -2vmax;
    right: 1vmax;
  }
  .cloud--1 {
    top: 20%;
    animation-duration: 40s;
  }
  .cloud--2 {
    top: 50%;
    transform: scale(0.7);
    animation-duration: 60s;
    animation-delay: -20s;
  }

  /*==============================*/
  /*       Keyframe Animations    */
  /*==============================*/
  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4vmax);
    }
  }

  @keyframes shadow-bob {
    0%,
    100% {
      transform: translateX(-50%) scale(1);
      opacity: 1;
    }
    50% {
      transform: translateX(-50%) scale(0.7);
      opacity: 0.5;
    }
  }

  @keyframes flap-left {
    0%,
    100% {
      transform: rotate(10deg);
    }
    50% {
      transform: rotate(-25deg);
    }
  }

  @keyframes flap-right {
    0%,
    100% {
      transform: rotate(-10deg);
    }
    50% {
      transform: rotate(25deg);
    }
  }

  @keyframes blink {
    0%,
    93%,
    96%,
    100% {
      transform: scaleY(1);
    }
    95% {
      transform: scaleY(0.1);
    }
  }

  @keyframes pupil-move {
    0%,
    30% {
      transform: translate(-50%, -50%);
    } /* Center */
    40%,
    60% {
      transform: translate(-80%, -50%);
    } /* Left */
    70%,
    90% {
      transform: translate(-20%, -50%);
    } /* Right */
    100% {
      transform: translate(-50%, -50%);
    } /* Center */
  }

  @keyframes dangle {
    0%,
    100% {
      transform: rotate(5deg);
    }
    50% {
      transform: rotate(-10deg);
    }
  }

  @keyframes head-tilt {
    0%,
    100% {
      transform: translateX(-50%) rotate(0deg);
    }
    20%,
    30% {
      transform: translateX(-50%) rotate(-8deg);
    }
    70%,
    80% {
      transform: translateX(-50%) rotate(8deg);
    }
  }

  @keyframes tuft-wiggle {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-0.3vmax);
    }
  }

  /* UPDATED: Removed vw unit */
  @keyframes cloud-drift {
    from {
      left: -25vmax;
    }
    to {
      left: 110%;
    } /* Changed from 100vw to 110% */
  }`;

export default Owl;
