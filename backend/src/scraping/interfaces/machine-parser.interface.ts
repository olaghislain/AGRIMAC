import { NormalizedMachine } from './normalized-machine.interface';

export interface MachineParser {
  parse(input: string): NormalizedMachine[];
}
