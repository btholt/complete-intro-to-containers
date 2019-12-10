import React from "react";
import Link from "gatsby-link";
import { graphql } from "gatsby";

export default function Template(props) {
  let { markdownRemark, allMarkdownRemark } = props.data; // data.markdownRemark holds our post data

  const { frontmatter, html } = markdownRemark;

  const index = allMarkdownRemark.edges.reduce(
    (acc, el, i) => (el.node.frontmatter.path === frontmatter.path ? i : acc),
    -1
  );

  const prevLink =
    index > 0 ? (
      <Link
        className="prev"
        to={allMarkdownRemark.edges[index - 1].node.frontmatter.path}
      >
        {"← " + allMarkdownRemark.edges[index - 1].node.frontmatter.title}
      </Link>
    ) : null;
  const nextLink =
    index < allMarkdownRemark.edges.length - 1 ? (
      <Link
        className="next"
        to={allMarkdownRemark.edges[index + 1].node.frontmatter.path}
      >
        {allMarkdownRemark.edges[index + 1].node.frontmatter.title + " →"}
      </Link>
    ) : null;
  return (
    <div className="lesson-container">
      <div className="lesson">
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>
        <div
          className="lesson-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="lesson-links">
          {prevLink}
          {nextLink}
        </div>
      </div>
    </div>
  );
}

export const pageQuery = graphql`
  query LessonByPath($path: String!) {
    markdownRemark(frontmatter: { path: { eq: $path } }) {
      html
      frontmatter {
        path
        title
        order
      }
    }
    allMarkdownRemark(
      sort: { order: ASC, fields: [frontmatter___order] }
      limit: 1000
    ) {
      edges {
        node {
          frontmatter {
            order
            path
            title
          }
        }
      }
    }
  }
`;
