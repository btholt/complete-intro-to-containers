import React from "react";
import Link from "gatsby-link";

import "./TOCCard.css";

const LessonCard = ({ content, title }) => {
  const sections = content
    .map(lesson => [lesson.node.frontmatter.section, lesson.node.frontmatter])
    .reduce((acc, [name, lesson]) => {
      if (!acc.length) {
        acc.push([lesson]);
        return acc;
      }

      const lastName = acc[acc.length - 1][0].section;
      if (lastName === name) {
        acc[acc.length - 1].push(lesson);
      } else {
        acc.push([lesson]);
      }

      return acc;
    }, []);

  return (
    <div className="main-card">
      <h1 className="lesson-title gradient">{title}</h1>
      <div className="lesson-content">
        <ol className="sections-name">
          {sections.map(section => (
            <li key={section[0].section}>
              <h3 className="lesson-section-title">{section[0].section}</h3>
              <ol>
                {section.map(lesson => (
                  <li key={lesson.path}>
                    <Link to={lesson.path}>{lesson.title}</Link>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default LessonCard;
