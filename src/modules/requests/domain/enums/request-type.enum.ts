export enum RequestType {
  SINGLE_GAME = 'SINGLE_GAME',
  TOURNAMENT = 'TOURNAMENT',
  TRAINING = 'TRAINING'
}

export enum RequestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  DONE = 'DONE'
}

export enum ResponseStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

export enum PaymentType {
  FREE = 'FREE',
  HOST_PAYS = 'HOST_PAYS',
  LOSER_PAYS = 'LOSER_PAYS',
  DIVIDED = 'DIVIDED',
  FIXED_PRICE = 'FIXED_PRICE'
}

export enum RatingType {
  RATED = 'RATED',
  UNRATED = 'UNRATED'
}