import { describe, expect, it } from 'vitest';
import { experiences, openSourceProjects, resumeProfile } from './resume';

const stripTags = (value: string) => value.replace(/<[^>]+>/g, '');

const allResumeText = [
  resumeProfile.name,
  resumeProfile.title,
  ...resumeProfile.contacts.map((contact) => `${contact.label} ${contact.href}`),
  ...experiences.flatMap((experience) => [
    experience.role,
    experience.company,
    experience.period,
    ...experience.projects.flatMap((project) => [
      project.name,
      ...project.links.map((link) => `${link.label} ${link.href}`),
      ...project.responsibilities.map(stripTags),
    ]),
  ]),
  ...openSourceProjects.flatMap((project) => [
    project.name,
    project.period,
    project.url,
    ...project.features.map(stripTags),
  ]),
].join('\n');

describe('resume data', () => {
  it('keeps the primary profile and current experience available', () => {
    expect(resumeProfile.name).toBe('심상현');
    expect(resumeProfile.contacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: 'mailto:simsanghyeon00@gmail.com' }),
        expect.objectContaining({ href: 'https://github.com/halfmoon-mind' }),
      ])
    );
    expect(experiences[0]).toMatchObject({
      role: 'Flutter Mobile Engineer',
      company: '어터',
      period: '2023년 10월 - 현재',
    });
  });

  it('does not contain known resume copy typos', () => {
    expect(allResumeText).not.toContain('남기겨');
    expect(allResumeText).not.toContain('기존와');
    expect(allResumeText).not.toContain('아키텍쳐');
    expect(allResumeText).not.toContain('어플리케이션');
    expect(allResumeText).not.toContain('Github Discussion');
  });
});
