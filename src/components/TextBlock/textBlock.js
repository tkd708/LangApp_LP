import React, { useEffect } from "react"
import styled from "styled-components"
import { useInView } from "react-intersection-observer"
import { motion, useAnimation } from "framer-motion"

const TextBlock = ({ title_en, title_jp, paragraph, children, id }) => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    // Percentage of item in view to trigger animation
    threshold: 0.25,
  })

   const browserLang = 'ja' 
   //(typeof window !== `undefined`)
   //? (window.navigator.languages && window.navigator.languages[0]) ||
   //         window.navigator.language ||
   //         window.navigator.userLanguage ||
   //         window.navigator.browserLanguage
   // : ''; // tentatively all in Japanese

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])
  return (
    <TextBlockWrapper id={id}>
      <div className="content-container">
        <motion.div
          ref={ref}
          animate={controls}
          initial="hidden"
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 25 },
          }}
          transition={{ ease: "easeOut", duration: 1.25, delay: 0.35 }}
        >
          <h2>{browserLang=='ja' 
          ? '会話から、学びつくす' 
          : 'Unlock the full potential of conversation'}</h2>

          <p>{browserLang=='ja' 
          ? "たった5分間の会話で約500語の言葉が交わされ、A4紙を埋め尽くします。"
          : "Just 5 minites of conversation has more than 500 words, which is a full A4 paper."}</p>

          <p>{browserLang=='ja' 
          ? '1回の会話クラスから、十分な学びを得ているでしょうか？'
          : 'When you attend conversation classes, how much feedback do you get? '}</p>
          <p></p>

          <p>{browserLang=='ja' 
          ? 'フィードバックをどれほど次に生かせていますか？'
          : 'Do you actually make most of them for the next?'}</p>
          <p></p>

          <h3>{browserLang=='ja' 
          ? 'LangAppは英会話を記録・分析し、上達を飛躍的に加速します！' 
          : 'LangApp is here to maximise your learning fromconversation to boost your speaking skills!'}</h3>

          <p>{paragraph}</p>
          {children}
        </motion.div>
      </div>
    </TextBlockWrapper>
  )
}

const TextBlockWrapper = styled.section`
  background: linear-gradient(45deg, #060c21, #0d0139);
  color: #fff;
  text-align: left;
  padding: 60px 20px;

  @media (min-width: 768px) {
    padding: 80px 30px;
    text-align: center;
  }

  h2 {
    color: #ee00b3;
    background: -webkit-linear-gradient(45deg, #f441a5, #03a9f4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

        font-size: 2.5rem;

        @media (min-width: 768px) {
          font-size: 3.5rem;
        }

        @media (min-width: 1200px) {
          font-size: 4.5rem;
        }

  }

  p {
    margin-bottom: 20px;
    font-size: 24px;
    text-shadow: 0px 0px 5px rgba(8, 0, 8, 1);
    opacity: 0.85;

          font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.3rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.6rem;
        }
 }

`

export default TextBlock
