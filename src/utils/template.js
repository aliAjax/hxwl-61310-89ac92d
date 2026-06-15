import { appConfig } from './storage';

export function addCustomTemplate(templateData, issue, purpose) {
  const next = {
    custom: { ...templateData.custom },
    favorites: { ...templateData.favorites },
    recent: { ...templateData.recent },
  };
  if (!next.custom[issue]) {
    next.custom[issue] = [];
  }
  if (!next.custom[issue].includes(purpose)) {
    next.custom[issue] = [...next.custom[issue], purpose];
  }
  return next;
}

export function removeCustomTemplate(templateData, issue, purpose) {
  const next = {
    custom: { ...templateData.custom },
    favorites: { ...templateData.favorites },
    recent: { ...templateData.recent },
  };
  if (next.custom[issue]) {
    next.custom[issue] = next.custom[issue].filter((item) => item !== purpose);
    if (next.custom[issue].length === 0) {
      delete next.custom[issue];
    }
  }
  if (next.favorites[issue]) {
    next.favorites[issue] = next.favorites[issue].filter((item) => item !== purpose);
    if (next.favorites[issue].length === 0) {
      delete next.favorites[issue];
    }
  }
  if (next.recent[issue]) {
    delete next.recent[issue][purpose];
    if (Object.keys(next.recent[issue]).length === 0) {
      delete next.recent[issue];
    }
  }
  return next;
}

export function toggleFavorite(templateData, issue, purpose) {
  const next = {
    custom: { ...templateData.custom },
    favorites: { ...templateData.favorites },
    recent: { ...templateData.recent },
  };
  if (!next.favorites[issue]) {
    next.favorites[issue] = [];
  }
  if (next.favorites[issue].includes(purpose)) {
    next.favorites[issue] = next.favorites[issue].filter((item) => item !== purpose);
    if (next.favorites[issue].length === 0) {
      delete next.favorites[issue];
    }
  } else {
    next.favorites[issue] = [...next.favorites[issue], purpose];
  }
  return next;
}

export function isFavorite(templateData, issue, purpose) {
  return templateData.favorites?.[issue]?.includes(purpose) ?? false;
}

export function recordRecentUse(templateData, issue, purpose) {
  const next = {
    custom: { ...templateData.custom },
    favorites: { ...templateData.favorites },
    recent: { ...templateData.recent },
  };
  if (!next.recent[issue]) {
    next.recent[issue] = {};
  }
  next.recent[issue] = { ...next.recent[issue], [purpose]: Date.now() };
  return next;
}

export function getAllTemplates(templateData) {
  const { custom = {}, favorites = {}, recent = {} } = templateData || {};
  const result = {};
  const allIssues = new Set([
    ...Object.keys(appConfig.purposeTemplates),
    ...Object.keys(custom),
  ]);

  allIssues.forEach((issue) => {
    const builtIn = appConfig.purposeTemplates[issue] || [];
    const userCustom = custom[issue] || [];
    const issueFavorites = favorites[issue] || [];
    const issueRecent = recent[issue] || {};

    const merged = [];
    const seen = new Set();

    [...builtIn, ...userCustom].forEach((item) => {
      if (!seen.has(item)) {
        seen.add(item);
        merged.push(item);
      }
    });

    merged.sort((a, b) => {
      const aFav = issueFavorites.includes(a) ? 1 : 0;
      const bFav = issueFavorites.includes(b) ? 1 : 0;
      if (aFav !== bFav) return bFav - aFav;

      const aRecent = issueRecent[a] || 0;
      const bRecent = issueRecent[b] || 0;
      if (aRecent !== bRecent) return bRecent - aRecent;

      const aBuiltIn = builtIn.includes(a) ? 0 : 1;
      const bBuiltIn = builtIn.includes(b) ? 0 : 1;
      if (aBuiltIn !== bBuiltIn) return aBuiltIn - bBuiltIn;

      return 0;
    });

    result[issue] = merged;
  });

  return result;
}

export function isBuiltInTemplate(issue, purpose) {
  return appConfig.purposeTemplates[issue]?.includes(purpose) ?? false;
}
