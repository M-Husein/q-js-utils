import cls from 'classnames';

/** classnames return undefined if length < 1 for prevent react render class="" */

function Cx() {
  return cls.apply(null, arguments) || undefined;
}

export { Cx as default };
