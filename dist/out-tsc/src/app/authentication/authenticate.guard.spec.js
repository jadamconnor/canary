import { TestBed, inject } from '@angular/core/testing';
import { AuthenticateGuard } from './authenticate.guard';
describe('AuthenticateGuard', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AuthenticateGuard]
        });
    });
    it('should ...', inject([AuthenticateGuard], (guard) => {
        expect(guard).toBeTruthy();
    }));
});
//# sourceMappingURL=authenticate.guard.spec.js.map