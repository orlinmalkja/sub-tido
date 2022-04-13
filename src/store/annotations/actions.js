import { request } from '@/utils/http';
import * as Utils from '@/utils';
import * as AnnotationUtils from 'src/utils/annotations';

export const addActiveAnnotation = ({ commit, getters, rootGetters }, id) => {
  const { activeAnnotations, annotations } = getters;
  const newActiveAnnotation = annotations.find((annotation) => annotation.id === id);

  if (!newActiveAnnotation || activeAnnotations[id]) {
    return;
  }

  const iconName = rootGetters['config/getAnnotationIcon'](newActiveAnnotation.body['x-content-type']);

  activeAnnotations[id] = newActiveAnnotation;
  commit('updateActiveAnnotations', { ...activeAnnotations });

  const selector = Utils.generateTargetSelector(newActiveAnnotation);
  const elements = (selector) ? [...document.querySelectorAll(selector)] : [];
  Utils.highlightTargets(selector, { operation: 'INC' });

  if (elements.length > 0) {
    Utils.addIcon(elements[0], newActiveAnnotation, iconName);
    elements[0].scrollIntoView({ behavior: 'smooth' });
  }
};

export const addHighlightAttributesToText = ({ getters }, dom) => {
  const { annotations } = getters;
  Utils.mapUniqueElements(
    Utils.findDomElements('[data-target]:not([value=""])', dom),
    (x) => x.getAttribute('data-target').replace('_start', '').replace('_end', ''),
  ).forEach((selector) => Utils.replaceSelectorWithSpan(selector, dom));

  annotations.forEach((annotation) => {
    const { id } = annotation;
    const selector = Utils.generateTargetSelector(annotation);
    if (selector) {
      Utils.addHighlightToElements(selector, dom, id);
    }
  });
};

export const annotationLoaded = ({ commit }, annotations) => {
  commit('updateAnnotations', annotations);
  commit('updateAnnotationLoading', false);
};

export const decreaseContentFontSize = ({ commit, state }) => {
  commit('updateContentFontSize', state.contentFontSize - 2);
};

export const increaseContentFontSize = ({ commit, state }) => {
  commit('updateContentFontSize', state.contentFontSize + 2);
};

export const loadAnnotations = ({ commit }) => {
  commit('updateAnnotationLoading', true);
  commit('updateAnnotations', []);
};

export const removeActiveAnnotation = ({ commit, getters }, id) => {
  const { activeAnnotations } = getters;

  const removeAnnotation = activeAnnotations[id];
  if (!removeAnnotation) {
    return;
  }

  delete activeAnnotations[id];
  commit('updateActiveAnnotations', { ...activeAnnotations });

  const selector = AnnotationUtils.generateTargetSelector(removeAnnotation);
  if (selector) {
    AnnotationUtils.highlightTargets(selector, { operation: 'DEC' });
    AnnotationUtils.removeIcon(removeAnnotation);
  }
};

export const resetActiveAnnotations = ({ commit, getters }) => {
  const { activeAnnotations } = getters;

  Object.keys(activeAnnotations).forEach((key) => {
    const activeAnnotation = activeAnnotations[key];
    const selector = AnnotationUtils.generateTargetSelector(activeAnnotation);
    if (selector) {
      AnnotationUtils.highlightTargets(selector, { level: -1 });
      AnnotationUtils.removeIcon(activeAnnotation);
    }
  });
  commit('updateActiveAnnotations', {});
};

export const updateActiveTab = ({ commit }, tab) => {
  commit('updateActiveTab', tab);
};

export const updateContentLoading = ({ commit }, isLoading) => {
  commit('updateContentLoading', isLoading);
};

export const initAnnotations = async ({ dispatch }, url) => {
  dispatch('loadAnnotations');

  try {
    const annotations = await request(url);

    if (!annotations.annotationCollection.first) {
      dispatch('annotationLoaded', []);
      return;
    }

    const current = await request(annotations.annotationCollection.first);

    if (current.annotationPage.items.length) {
      dispatch('annotationLoaded', current.annotationPage.items);
    } else {
      dispatch('annotationLoaded', []);
    }
  } catch (err) {
    dispatch('annotationLoaded', []);
  }
};
