import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ImagesRepository } from './images.repository';
import { AppConfigService } from '@/shared/config/app-config.service';

@Injectable()
export class ImageGcJob {
  private isRunning = false; // 단일 인스턴스 최소 중복 방지
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly imagesRepository: ImagesRepository,
  ) {}

  @Cron('*/10 * * * *') // 10분마다
  async run() {
    if (this.isRunning) {
      console.log(
        'GC job skipped: 이전 작업이 진행 중입니다. 작업이 중단됩니다.',
      );
      return;
    }

    this.isRunning = true;
    const startedAt = Date.now();

    try {
      const rows = await this.imagesRepository.getDeletePendingImages();

      if (rows.length === 0) {
        console.log(
          'delete_pending 이미지가 존재하지 않습니다. 작업이 중단됩니다.',
        );
        return;
      }

      let success = 0;
      let failed = 0;

      const CONCURRENCY = 5;

      // 순차 처리를 위해 처리량 제한
      for (let i = 0; i < rows.length; i += CONCURRENCY) {
        const chunk = rows.slice(i, i + CONCURRENCY);

        await Promise.all(
          chunk.map(async (row) => {
            try {
              // 네트워크 예외 처리를 위한 row 단위 try/catch
              const res = await fetch(
                `https://api.cloudflare.com/client/v4/accounts/${this.appConfigService.cloudflare.accountId}/images/v1/${row.imageId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${this.appConfigService.cloudflare.token}`,
                  },
                },
              );

              if (!res.ok) {
                const bodyText = await res.text().catch(() => '');
                failed += 1;
                console.log(
                  `이미지 삭제 실패 imageId=${row.imageId}, status=${res.status}, body=${bodyText.slice(0, 100)}`,
                );

                return;
              }

              await this.imagesRepository.markImageStatusByDeleted(row.id);

              success += 1;
            } catch (error) {
              failed += 1;
              console.log(
                `이미지 삭제 실패 imageId=${row.imageId}: ${(error as Error).message}`,
                `${(error as Error).stack}`,
              );
            }
          }),
        );
      }

      console.log(
        `작업이 완료되었습니다. total=${rows.length}, success=${success}, failed=${failed} elapsedMs=${Date.now() - startedAt}`,
      );
    } finally {
      this.isRunning = false;
    }
  }
}
