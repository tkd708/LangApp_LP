import React from "react"
import styled from "styled-components"
import Button from "../Button/button"
import { useStaticQuery, graphql } from "gatsby"
import BackgroundImage from "gatsby-background-image"

const Contact = ({ id }) => {
      const data = useStaticQuery(graphql`
    query {
      file(relativePath: { eq: "blackboard.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 2000, quality: 90) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `)

       const browserLang =  (typeof window !== `undefined`)
   ? (window.navigator.languages && window.navigator.languages[0]) ||
            window.navigator.language ||
            window.navigator.userLanguage ||
            window.navigator.browserLanguage
    : '';

  return (
    <BackgroundImage
      //className="background-img"
      id={id}
      Tag="section"
      fluid={data.file.childImageSharp.fluid}
    >
    <ContactWrapper id="contact">
      <div className="content-container">
        <h2>{browserLang=='ja'
        ? "お問い合わせ" 
        : "CONTACT US"}
        </h2>
        <p> {browserLang=='ja'
        ? "LangAppは現在開発中です" 
        : "LangApp is currently under development and needs your voice..."}
        </p>
        <p> {browserLang=='ja'
        ? "ぜひご意見をお聞かせください！" 
        : "We'd love to in touch with you!"}
        </p>

        <form
          name="contact"
          method="POST"
          data-netlify="true"
          data-netlify-honeypot="bot-field"
        >
          <input type="hidden" name="form-name" value="contact" />
          <div className="input-area">
            <input
              type="text"
              name="name"
              aria-label="Name"
              required
              autoComplete="off"
            />
            <label className="label-name" for="name">
              <span className="content-name">Name</span>
            </label>
          </div>

          <div className="input-area">
            <input
              type="email"
              name="email"
              aria-label="Email"
              required
              autoComplete="off"
            />
            <label className="label-name" for="email">
              <span className="content-name">Email</span>
            </label>
          </div>
{/*
          <div className="input-area">
            <input
              type="select"
              name="plan"
              aria-label="Plan"
              required
              autoComplete="off"
            />
            <label className="label-name" for="plan">
              <span className="content-name">Plan interested</span>
            </label>
          </div>
*/}

          <div className="input-area">
            <textarea
              type="text"
              name="message"
              rows="5"
              required
              autoComplete="off"
              aria-label="Message"
            />
            <label className="label-name" for="message">
              <span className="content-name">Message</span>
            </label>
          </div>

          <div className="input-area button-area">
            <Button
              label="Send Contact Form"
              cta={browserLang=='ja' ? "送信！" : "SEND！"}
              type="submit"
            />
          </div>
        </form>
      </div>
    </ContactWrapper>
        </BackgroundImage>
  )
}

const ContactWrapper = styled.section`
  padding: 100px 30px;

  .content-container {
    width: 100%;
    margin: 0 auto;

    h2 {
      text-align: left;
      background: -webkit-linear-gradient(45deg, #f441a5, #03a9f4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;

      @media (min-width: 768px) {
        text-align: center;
      }

          font-size: 2.5rem;

        @media (min-width: 768px) {
          font-size: 3.0rem;
        }

        @media (min-width: 1200px) {
          font-size: 3.5rem;
        }

    }
    p {
      margin-bottom: 2rem;

      @media (min-width: 768px) {
        text-align: center;
      }

         font-size: 1.2rem;

        @media (min-width: 768px) {
          font-size: 1.3rem;
        }

        @media (min-width: 1200px) {
          font-size: 1.6rem;
        }
 
    }

    form {
      position: relative;
      overflow: hidden;

      .input-area {
        margin-bottom: 40px;
        position: relative;

        &.button-area {
          text-align: center;
          margin-bottom: 0;
        }
      }

      input,
      textarea {
        height: 100%;
        font-size: 1rem;
        letter-spacing: 0.25rem;
        padding: 20px;
        display: block;
        width: 100% !important;
        border: none;
        background-color: #0b132e;
        color: #fff;
        text-transform: uppercase;
        position: relative;
        box-sizing: border-box;
        outline: none;

        &:focus,
        &:valid {
          + .label-name {
            .content-name {
              transform: translateY(-25%);
              font-size: 0.7rem;
              opacity: 0.2;
            }
            &::after {
              transform: translateX(0%);
            }
          }
        }
      }

      label {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
        pointer-events: none;

        &::after {
          content: "";
          position: absolute;
          left: 0px;
          bottom: -1px;
          height: 1px;
          background: linear-gradient(90deg, #f441a5, #03a9f4);
          width: 100%;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
      }

      .content-name {
        position: absolute;
        top: 10px;
        left: 20px;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.25rem;
        font-size: 0.8rem;
      }
    }
  }
`

export default Contact
