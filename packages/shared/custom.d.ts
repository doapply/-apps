declare module '*.css';

type SvgrComponent = React.FC<React.SVGAttributes<SVGElement>>;

declare module '*.svg' {
  const value: SvgrComponent;
  export default value;
}
