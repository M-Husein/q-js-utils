import cls from 'classnames';

/** classnames return undefined if length < 1 for prevent react render class="" */
export default function Cx(){
	return cls.apply(null, arguments) || undefined;
}
