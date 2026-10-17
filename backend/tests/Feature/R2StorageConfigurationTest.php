<?php

namespace Tests\Feature;

use Tests\TestCase;

class R2StorageConfigurationTest extends TestCase
{
    public function test_private_r2_disk_is_separate_from_existing_storage(): void
    {
        $r2 = config('filesystems.disks.r2');

        $this->assertSame('s3', $r2['driver']);
        $this->assertSame('auto', $r2['region']);
        $this->assertTrue($r2['use_path_style_endpoint']);
        $this->assertSame('private', $r2['visibility']);
        $this->assertTrue($r2['throw']);
        $this->assertSame('local', config('filesystems.default'));
        $this->assertSame('local', config('filesystems.disks.public.driver'));
    }

    public function test_r2_rollout_is_disabled_until_authorized_delivery_is_ready(): void
    {
        $this->assertFalse(config('educational_storage.r2_new_uploads_enabled'));
        $this->assertFalse(config('educational_storage.r2_signed_reads_enabled'));
        $this->assertSame(120, config('educational_storage.r2_url_ttl_seconds'));
    }

    public function test_connection_check_refuses_to_run_without_credentials(): void
    {
        config()->set('filesystems.disks.r2.key', null);
        config()->set('filesystems.disks.r2.secret', null);

        $this->artisan('yourschool:r2-check')->assertExitCode(1);
    }
}
