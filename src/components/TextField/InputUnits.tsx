interface Props {
  units: string;
}

const InputUnits = ({ units }: Props) => (
  <p aria-label="units-of-measurement" className="text-9px text-grey-420">
    {units}
  </p>
);

export default InputUnits;
