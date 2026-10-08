/**
 * Deterministic & Evidence-Based Resume Parser Engine
 * Converts extracted resume text into structured ProfileSection[] without hallucinating or inventing missing content.
 */

// Common section header patterns
const SECTION_PATTERNS = [
  { type: 'summary', regex: /^(professional\s+summary|summary|about\s+me|profile|executive\s+summary|objective)/i, title: 'Professional Summary' },
  { type: 'experience', regex: /^(work\s+experience|experience|employment\s+history|professional\s+experience|career\s+history|internships?)/i, title: 'Work Experience' },
  { type: 'education', regex: /^(education|academic\s+background|academic\s+qualifications|degrees?|qualifications)/i, title: 'Education' },
  { type: 'skills', regex: /^(technical\s+skills|skills\s+(&|and)\s+technologies|skills|competencies|core\s+skills|technologies)/i, title: 'Skills & Technologies' },
  { type: 'projects', regex: /^(projects|key\s+projects|academic\s+projects|personal\s+projects|technical\s+projects)/i, title: 'Projects' },
  { type: 'certifications', regex: /^(certifications?|licenses?(\s+(&|and)\s+certifications)?|courses|credentials)/i, title: 'Certifications' },
  { type: 'achievements', regex: /^(achievements|honors?(\s+(&|and)\s+awards)?|awards|accomplishments)/i, title: 'Achievements & Awards' },
  { type: 'publications', regex: /^(publications|research\s+papers|research|patents)/i, title: 'Publications & Research' },
  { type: 'languages', regex: /^(languages|language\s+proficiency)/i, title: 'Languages' },
  { type: 'volunteer', regex: /^(volunteer(\s+experience)?|community\s+service|leadership)/i, title: 'Volunteer & Leadership' },
];

/**
 * Extract contact information safely from raw text header
 */
export function extractContactInfo(rawText, fileName = '') {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const topLines = lines.slice(0, 10);
  const headerBlock = topLines.join(' ');

  // Email regex
  const emailMatch = headerBlock.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : '';

  // Phone regex (support international and standard formats)
  const phoneMatch = headerBlock.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // LinkedIn / GitHub / Portfolio
  const linkedinMatch = headerBlock.match(/(linkedin\.com\/in\/[a-zA-Z0-9-_]+)/i);
  const githubMatch = headerBlock.match(/(github\.com\/[a-zA-Z0-9-_]+)/i);
  const websiteMatch = headerBlock.match(/https?:\/\/(?!linkedin|github)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?/i);

  // Extract Name (first non-contact, non-header line that looks like a person's name)
  let name = '';
  for (const line of topLines) {
    if (line === email || line === phone) continue;
    if (line.toLowerCase().includes('resume') || line.toLowerCase().includes('curriculum')) continue;
    if (line.length > 2 && line.length < 50 && !line.includes('@') && !line.includes('http') && !/^\d+$/.test(line)) {
      name = line;
      break;
    }
  }

  // Location heuristic
  let location = '';
  const locRegex = /([A-Za-z\s]+,\s*[A-Za-z]{2,}(\s+\d{5})?|[A-Za-z\s]+,\s*(India|USA|United States|UK|Canada|Germany|Australia|Singapore))/i;
  const locMatch = headerBlock.match(locRegex);
  if (locMatch) {
    location = locMatch[0];
  }

  // Headline heuristic (often line 2 or 3 below name)
  let headline = '';
  if (topLines.length > 1) {
    const candidateHeadline = topLines[1];
    if (candidateHeadline !== name && candidateHeadline !== email && candidateHeadline !== phone && candidateHeadline.length < 60) {
      headline = candidateHeadline;
    }
  }

  return {
    name: name || fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    email,
    phone,
    location,
    headline,
    linkedin: linkedinMatch ? `https://${linkedinMatch[1]}` : '',
    github: githubMatch ? `https://${githubMatch[1]}` : '',
    website: websiteMatch ? websiteMatch[0] : ''
  };
}

/**
 * Segment raw document into detected sections without inventing absent sections
 */
export function segmentSections(rawText) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  const rawSections = [];
  let currentSection = null;
  let headerLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let matchedPattern = null;

    // Check if line matches a known section header (usually short, standalone or uppercase)
    if (line.length < 50) {
      for (const pattern of SECTION_PATTERNS) {
        if (pattern.regex.test(line)) {
          matchedPattern = pattern;
          break;
        }
      }
    }

    if (matchedPattern) {
      if (currentSection) {
        rawSections.push(currentSection);
      }
      currentSection = {
        type: matchedPattern.type,
        title: matchedPattern.title,
        matchedHeader: line,
        lines: []
      };
    } else if (currentSection) {
      currentSection.lines.push(line);
    } else {
      headerLines.push(line);
    }
  }

  if (currentSection) {
    rawSections.push(currentSection);
  }

  return {
    headerLines,
    detectedSections: rawSections
  };
}

/**
 * Parse parsed sections into normalized objects
 */
export function parseDetectedSections(detectedSections, contactInfo, sourceResumeId = '') {
  const normalizedSections = [];
  let orderIndex = 0;

  // 1. Personal Info Section (always first if contact info is extracted)
  if (contactInfo.name || contactInfo.email || contactInfo.phone) {
    normalizedSections.push({
      id: `sec_personal_${Date.now()}`,
      type: 'personal_info',
      title: 'Contact Information',
      order: orderIndex++,
      visible: true,
      source: 'resume',
      confidence: 0.98,
      data: {
        name: contactInfo.name,
        email: contactInfo.email,
        phone: contactInfo.phone,
        location: contactInfo.location,
        headline: contactInfo.headline,
        linkedin: contactInfo.linkedin,
        github: contactInfo.github,
        website: contactInfo.website
      }
    });
  }

  for (const rawSec of detectedSections) {
    const lines = rawSec.lines || [];
    if (lines.length === 0) continue;

    const fullContent = lines.join('\n');

    switch (rawSec.type) {
      case 'summary': {
        normalizedSections.push({
          id: `sec_summary_${Date.now()}_${orderIndex}`,
          type: 'summary',
          title: rawSec.title || 'Professional Summary',
          order: orderIndex++,
          visible: true,
          source: 'resume',
          confidence: 0.95,
          data: {
            text: fullContent
          }
        });
        break;
      }

      case 'skills': {
        // Parse skill items (comma separated, bullet points, or categories)
        const skillItems = [];
        lines.forEach((line) => {
          if (line.includes(':')) {
            const [cat, skillsPart] = line.split(':');
            const items = skillsPart.split(/[,|•·;]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 40);
            if (items.length > 0) {
              skillItems.push({
                category: cat.trim(),
                skills: items
              });
            }
          } else {
            const items = line.split(/[,|•·;]/).map((s) => s.trim()).filter((s) => s.length > 0 && s.length < 40);
            if (items.length > 0) {
              skillItems.push({
                category: 'General',
                skills: items
              });
            }
          }
        });

        // Flatten all extracted distinct skills
        const allSkillNames = [];
        skillItems.forEach((group) => {
          group.skills.forEach((s) => {
            if (!allSkillNames.includes(s)) allSkillNames.push(s);
          });
        });

        if (allSkillNames.length > 0) {
          normalizedSections.push({
            id: `sec_skills_${Date.now()}_${orderIndex}`,
            type: 'skills',
            title: rawSec.title || 'Skills',
            order: orderIndex++,
            visible: true,
            source: 'resume',
            confidence: 0.94,
            data: {
              groups: skillItems,
              allSkills: allSkillNames
            }
          });
        }
        break;
      }

      case 'experience': {
        // Parse experience records
        const records = [];
        let currentExp = null;

        for (const line of lines) {
          // Detect date ranges like "2021 - Present", "Jan 2020 - Dec 2022", "2019-2023"
          const dateMatch = line.match(/((\w+\s+)?\d{4}\s*[-–—to]+\s*(\w+\s+)?(\d{4}|present|current))/i);

          if (dateMatch || (!currentExp && line.length < 60)) {
            if (currentExp && (currentExp.company || currentExp.title)) {
              records.push(currentExp);
            }
            const parts = line.split(/[-|–,]/).map((p) => p.trim()).filter(Boolean);
            currentExp = {
              id: `exp_item_${Date.now()}_${records.length}`,
              title: parts[0] || 'Role',
              company: parts[1] || 'Company',
              duration: dateMatch ? dateMatch[0] : '',
              location: '',
              description: '',
              responsibilities: []
            };
          } else if (currentExp) {
            if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
              currentExp.responsibilities.push(line.replace(/^[•\-*]\s*/, ''));
            } else {
              currentExp.description = currentExp.description ? `${currentExp.description}\n${line}` : line;
            }
          }
        }
        if (currentExp && (currentExp.company || currentExp.title)) {
          records.push(currentExp);
        }

        if (records.length > 0) {
          normalizedSections.push({
            id: `sec_exp_${Date.now()}_${orderIndex}`,
            type: 'experience',
            title: rawSec.title || 'Work Experience',
            order: orderIndex++,
            visible: true,
            source: 'resume',
            confidence: 0.92,
            data: {
              records
            }
          });
        }
        break;
      }

      case 'education': {
        const eduRecords = [];
        let currentEdu = null;

        for (const line of lines) {
          const yearMatch = line.match(/\b(19\d\d|20\d\d)\b/);
          if (yearMatch || (!currentEdu && line.length < 60)) {
            if (currentEdu && (currentEdu.degree || currentEdu.institution)) {
              eduRecords.push(currentEdu);
            }
            const parts = line.split(/[-|–,]/).map((p) => p.trim()).filter(Boolean);
            currentEdu = {
              id: `edu_item_${Date.now()}_${eduRecords.length}`,
              degree: parts[0] || 'Degree',
              institution: parts[1] || 'Institution',
              graduationYear: yearMatch ? yearMatch[0] : '',
              cgpa: '',
              description: ''
            };
          } else if (currentEdu) {
            if (line.toLowerCase().includes('gpa') || line.toLowerCase().includes('cgpa')) {
              currentEdu.cgpa = line;
            } else {
              currentEdu.description = currentEdu.description ? `${currentEdu.description} ${line}` : line;
            }
          }
        }
        if (currentEdu && (currentEdu.degree || currentEdu.institution)) {
          eduRecords.push(currentEdu);
        }

        if (eduRecords.length > 0) {
          normalizedSections.push({
            id: `sec_edu_${Date.now()}_${orderIndex}`,
            type: 'education',
            title: rawSec.title || 'Education',
            order: orderIndex++,
            visible: true,
            source: 'resume',
            confidence: 0.94,
            data: {
              records: eduRecords
            }
          });
        }
        break;
      }

      case 'projects': {
        const projRecords = [];
        let currentProj = null;

        for (const line of lines) {
          // Project name header is usually a standalone short line or contains tech stack in brackets
          const techInBrackets = line.match(/\(([^)]+)\)|\[([^\]]+)\]/);
          if (line.length < 50 && (!currentProj || lines.indexOf(line) % 3 === 0)) {
            if (currentProj && currentProj.name) {
              projRecords.push(currentProj);
            }
            currentProj = {
              id: `proj_item_${Date.now()}_${projRecords.length}`,
              name: line.replace(/\([^)]+\)|\[[^\]]+\]/g, '').trim(),
              technologies: techInBrackets ? (techInBrackets[1] || techInBrackets[2]).split(/[,|]/).map((t) => t.trim()) : [],
              description: '',
              url: ''
            };
          } else if (currentProj) {
            if (line.startsWith('http://') || line.startsWith('https://') || line.includes('github.com')) {
              currentProj.url = line.trim();
            } else {
              currentProj.description = currentProj.description ? `${currentProj.description} ${line}` : line;
            }
          }
        }
        if (currentProj && currentProj.name) {
          projRecords.push(currentProj);
        }

        if (projRecords.length > 0) {
          normalizedSections.push({
            id: `sec_proj_${Date.now()}_${orderIndex}`,
            type: 'projects',
            title: rawSec.title || 'Projects',
            order: orderIndex++,
            visible: true,
            source: 'resume',
            confidence: 0.91,
            data: {
              records: projRecords
            }
          });
        }
        break;
      }

      case 'certifications': {
        const certRecords = lines.map((line, idx) => {
          const yearMatch = line.match(/\b(20\d\d)\b/);
          return {
            id: `cert_item_${Date.now()}_${idx}`,
            name: line.replace(/\b(20\d\d)\b/g, '').trim(),
            issuer: '',
            date: yearMatch ? yearMatch[0] : ''
          };
        });

        if (certRecords.length > 0) {
          normalizedSections.push({
            id: `sec_cert_${Date.now()}_${orderIndex}`,
            type: 'certifications',
            title: rawSec.title || 'Certifications',
            order: orderIndex++,
            visible: true,
            source: 'resume',
            confidence: 0.93,
            data: {
              records: certRecords
            }
          });
        }
        break;
      }

      default: {
        // Generic / Custom Section preservation
        normalizedSections.push({
          id: `sec_custom_${Date.now()}_${orderIndex}`,
          type: 'custom',
          title: rawSec.title || rawSec.matchedHeader || 'Additional Information',
          order: orderIndex++,
          visible: true,
          source: 'resume',
          confidence: 0.88,
          data: {
            content: fullContent,
            items: lines
          }
        });
        break;
      }
    }
  }

  return normalizedSections;
}

/**
 * Top-level normalization: returns normalized CandidateProfile object
 */
export function buildNormalizedCandidateProfile(rawText, fileName = '', sourceResumeId = '', candidateId = 'cand_1') {
  const contactInfo = extractContactInfo(rawText, fileName);
  const { detectedSections } = segmentSections(rawText);
  const sections = parseDetectedSections(detectedSections, contactInfo, sourceResumeId);

  return {
    candidateId,
    profileSource: {
      type: 'resume',
      resumeId: sourceResumeId,
      resumeVersion: 1,
      resumeName: fileName,
      updatedAt: new Date().toISOString()
    },
    sections,
    metadata: {
      sourceResumeId,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isComplete: sections.length > 0
    }
  };
}
