import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  getGivenName(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getFamilyName(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getBirthYear(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getBirthMonth(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getBirthDay(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getDocumentNumber(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getBirthPlaceHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getAddressHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  getGender(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, bigint];
  getNationality(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  disclose_selected_cin_claims(context: __compactRuntime.CircuitContext<PS>,
                               disclose_given_name_0: boolean,
                               disclose_family_name_0: boolean,
                               disclose_birthdate_0: boolean,
                               disclose_document_number_0: boolean,
                               disclose_birth_place_0: boolean,
                               disclose_address_0: boolean,
                               disclose_gender_0: boolean,
                               disclose_nationality_0: boolean,
                               current_year_0: bigint,
                               current_month_0: bigint,
                               current_day_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  disclose_selected_cin_claims(context: __compactRuntime.CircuitContext<PS>,
                               disclose_given_name_0: boolean,
                               disclose_family_name_0: boolean,
                               disclose_birthdate_0: boolean,
                               disclose_document_number_0: boolean,
                               disclose_birth_place_0: boolean,
                               disclose_address_0: boolean,
                               disclose_gender_0: boolean,
                               disclose_nationality_0: boolean,
                               current_year_0: bigint,
                               current_month_0: bigint,
                               current_day_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly attestation_count: bigint;
  readonly givenName: Uint8Array;
  readonly familyName: Uint8Array;
  readonly birthYear: bigint;
  readonly birthMonth: bigint;
  readonly birthDay: bigint;
  readonly documentNumber: bigint;
  readonly birthPlaceHash: Uint8Array;
  readonly addressHash: Uint8Array;
  readonly gender: bigint;
  readonly nationality: Uint8Array;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
