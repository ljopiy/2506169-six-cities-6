import { prop } from '@typegoose/typegoose';

export class CoordinatesSchema {
  @prop({
    required: true,
    type: () => Number,
    min: -90,
    max: 90
  })
  public latitude!: number;

  @prop({
    required: true,
    type: () => Number,
    min: -180,
    max: 180
  })
  public longitude!: number;
}
