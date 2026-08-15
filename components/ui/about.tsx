"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Ref } from "react";
import { gsap } from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import type {
  AboutCallbacks,
  AboutConfig,
  LocationInfo,
  Project,
  SocialLinks,
} from "@/lib/constants";

gsap.registerPlugin(ScrambleTextPlugin);

type ScrambleField = "artist" | "album" | "category" | "label" | "year";

const SCRAMBLE_FIELDS: ScrambleField[] = [
  "artist",
  "album",
  "category",
  "label",
  "year",
];
const SCRAMBLE_CHARS = "qwerty1337h@ck3r";
const NO_CALLBACKS: AboutCallbacks = {};

const DEFAULT_CONFIG: AboutConfig = {
  timeUpdateInterval: 1000,
  idleDelay: 4000,
};

interface TimeDisplayProps {
  config: AboutConfig;
}

const TimeDisplay = ({ config }: TimeDisplayProps) => {
  const [time, setTime] = useState({ hours: "", minutes: "", dayPeriod: "" });

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: config.timeZone,
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });

    const updateTime = () => {
      const parts = formatter.formatToParts(new Date());
      setTime({
        hours: parts.find((part) => part.type === "hour")?.value ?? "",
        minutes: parts.find((part) => part.type === "minute")?.value ?? "",
        dayPeriod: parts.find((part) => part.type === "dayPeriod")?.value ?? "",
      });
    };

    updateTime();
    const interval = setInterval(updateTime, config.timeUpdateInterval);
    return () => clearInterval(interval);
  }, [config.timeZone, config.timeUpdateInterval]);

  return (
    <time className="corner-item bottom-right">
      {time.hours}
      <span className="time-blink">:</span>
      {time.minutes} {time.dayPeriod}
    </time>
  );
};

interface ProjectItemProps {
  project: Project;
  index: number;
  isActive: boolean;
  isIdle: boolean;
  onMouseEnter: (index: number, imageUrl: string) => void;
  onMouseLeave: () => void;
  ref: Ref<HTMLLIElement>;
}

const ProjectItem = ({
  project,
  index,
  isActive,
  isIdle,
  onMouseEnter,
  onMouseLeave,
  ref,
}: ProjectItemProps) => {
  const textRefs = useRef<Map<ScrambleField, HTMLSpanElement>>(new Map());

  useEffect(() => {
    SCRAMBLE_FIELDS.forEach((field) => {
      const el = textRefs.current.get(field);
      if (!el) return;

      gsap.killTweensOf(el);

      if (isActive) {
        gsap.to(el, {
          duration: 0.8,
          scrambleText: {
            text: project[field],
            chars: SCRAMBLE_CHARS,
            revealDelay: 0.3,
            speed: 0.4,
          },
        });
      } else {
        el.textContent = project[field];
      }
    });
  }, [isActive, project]);

  const setTextRef = (field: ScrambleField) => (el: HTMLSpanElement | null) => {
    if (el) {
      textRefs.current.set(field, el);
    } else {
      textRefs.current.delete(field);
    }
  };

  return (
    <li
      ref={ref}
      className={`project-item ${isActive ? "active" : ""} ${isIdle ? "idle" : ""}`}
      onMouseEnter={() => onMouseEnter(index, project.image)}
      onMouseLeave={onMouseLeave}
      data-image={project.image}
    >
      {SCRAMBLE_FIELDS.map((field) => (
        <span
          key={field}
          ref={setTextRef(field)}
          className={`project-data ${field} hover-text`}
        >
          {project[field]}
        </span>
      ))}
    </li>
  );
};

export interface AboutProps {
  projects?: Project[];
  config?: AboutConfig;
  socialLinks?: SocialLinks;
  location?: LocationInfo;
  callbacks?: AboutCallbacks;
}

const About = ({
  projects = [],
  config = DEFAULT_CONFIG,
  socialLinks,
  location,
  callbacks = NO_CALLBACKS,
}: AboutProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isIdle, setIsIdle] = useState(true);

  const backgroundRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const projectItemsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    projects.forEach((project) => {
      if (project.image) {
        const img = new Image();
        img.src = project.image;
      }
    });
  }, [projects]);

  const startIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) return;

    callbacks.onIdleStart?.();

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    projectItemsRef.current.forEach((item, index) => {
      if (!item) return;

      const hideTime = index * 0.05;
      const showTime = projects.length * 0.05 * 0.5 + index * 0.05;

      timeline.to(
        item,
        { opacity: 0.05, duration: 0.1, ease: "power2.inOut" },
        hideTime
      );
      timeline.to(
        item,
        { opacity: 1, duration: 0.1, ease: "power2.inOut" },
        showTime
      );
    });

    idleAnimationRef.current = timeline;
  }, [callbacks, projects.length]);

  const stopIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) {
      idleAnimationRef.current.kill();
      idleAnimationRef.current = null;

      projectItemsRef.current.forEach((item) => {
        if (item) {
          gsap.set(item, { opacity: 1 });
        }
      });
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      if (activeIndex === -1) {
        setIsIdle(true);
        startIdleAnimation();
      }
    }, config.idleDelay);
  }, [activeIndex, config.idleDelay, startIdleAnimation]);

  const stopIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const handleProjectMouseEnter = useCallback(
    (index: number, imageUrl: string) => {
      stopIdleAnimation();
      stopIdleTimer();
      setIsIdle(false);

      if (activeIndex !== index) {
        setActiveIndex(index);
        callbacks.onProjectHover?.(projects[index]);
      }

      const bg = backgroundRef.current;
      if (imageUrl && bg) {
        bg.style.transition = "none";
        bg.style.transform = "translate(-50%, -50%) scale(1.2)";
        bg.style.backgroundImage = `url(${imageUrl})`;
        bg.style.opacity = "1";

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            bg.style.transition =
              "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            bg.style.transform = "translate(-50%, -50%) scale(1)";
          });
        });
      }
    },
    [activeIndex, callbacks, projects, stopIdleAnimation, stopIdleTimer]
  );

  const handleProjectMouseLeave = useCallback(() => {
    callbacks.onProjectLeave?.();
  }, [callbacks]);

  const handleContainerMouseLeave = useCallback(() => {
    setActiveIndex(-1);
    callbacks.onContainerLeave?.();

    if (backgroundRef.current) {
      backgroundRef.current.style.opacity = "0";
    }

    startIdleTimer();
  }, [callbacks, startIdleTimer]);

  useEffect(() => {
    startIdleTimer();
    return () => {
      stopIdleTimer();
      stopIdleAnimation();
    };
  }, [startIdleTimer, stopIdleTimer, stopIdleAnimation]);

  return (
    <section className="about-section">
      <div
        className={`portfolio-container ${activeIndex !== -1 ? "has-active" : ""}`}
        onMouseLeave={handleContainerMouseLeave}
      >
        <h2 className="sr-only">Music Portfolio</h2>
        <ul className="project-list" role="list">
          {projects.map((project, index) => (
            <ProjectItem
              key={project.id}
              ref={(el) => {
                projectItemsRef.current[index] = el;
              }}
              project={project}
              index={index}
              onMouseEnter={handleProjectMouseEnter}
              onMouseLeave={handleProjectMouseLeave}
              isActive={activeIndex === index}
              isIdle={isIdle}
            />
          ))}
        </ul>
      </div>

      <div
        ref={backgroundRef}
        className="background-image"
        role="img"
        aria-hidden="true"
      />

      <aside className="corner-elements">
        <div className="corner-item top-left">
          <div className="corner-square" aria-hidden="true" />
        </div>
        {socialLinks && (
          <nav className="corner-item top-right">
            <a href={socialLinks.spotify} target="_blank" rel="noopener noreferrer">
              Spotify
            </a>{" "}
            | <a href={socialLinks.email}>Email</a> |{" "}
            <a href={socialLinks.x} target="_blank" rel="noopener noreferrer">
              X
            </a>
          </nav>
        )}
        {location?.display && (
          <div className="corner-item bottom-left">
            {location.latitude}, {location.longitude}
          </div>
        )}
        <TimeDisplay config={config} />
      </aside>
    </section>
  );
};

export default About;
