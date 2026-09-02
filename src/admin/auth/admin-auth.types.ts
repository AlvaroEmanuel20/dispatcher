export type JwtAdminPayload = {
  sub: string;
  role: string;
  isActive: boolean;
};

export interface AuthenticatedAdminRequest extends Request {
  user: JwtAdminPayload;
}
