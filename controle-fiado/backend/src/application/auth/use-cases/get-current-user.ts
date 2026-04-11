import type { TokenService } from "../../ports/token-service.js";
import type { UserRepository } from "../../ports/user-repository.js";

export class GetCurrentUserUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository
  ) {}

  async execute(authorizationHeader?: string) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw new Error("Token ausente.");
    }

    const token = authorizationHeader.slice("Bearer ".length);
    const payload = await this.tokenService.verify(token);

    return this.userRepository.findById(payload.sub);
  }
}
