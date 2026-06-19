{ config, lib, pkgs, ... }:

let
  cfg = config.services.easypdfnex;
in
{
  options.services.easypdfnex = {
    enable = lib.mkEnableOption "easypdfnex - Professional PDF Tools";

    package = lib.mkOption {
      type = lib.types.package;
      default = pkgs.easypdfnex;
      defaultText = lib.literalExpression "pkgs.easypdfnex";
      description = "The easypdfnex package to use.";
    };

    port = lib.mkOption {
      type = lib.types.port;
      default = 3000;
      description = "Port to listen on.";
    };

    openFirewall = lib.mkOption {
      type = lib.types.bool;
      default = false;
      description = "Whether to open the firewall port.";
    };
  };

  config = lib.mkIf cfg.enable {
    nixpkgs.overlays = [
      (final: prev: {
        easypdfnex = final.callPackage ./package.nix { };
      })
    ];

    systemd.services.easypdfnex = {
      description = "easypdfnex PDF Tools";
      after = [ "network.target" ];
      wantedBy = [ "multi-user.target" ];

      environment = {
        easypdfnex_PORT = toString cfg.port;
      };

      serviceConfig = {
        ExecStart = "${cfg.package}/bin/easypdfnex";
        Restart = "on-failure";
        DynamicUser = true;
        RuntimeDirectory = "easypdfnex";
        StateDirectory = "easypdfnex";

        # Hardening
        NoNewPrivileges = true;
        ProtectSystem = "strict";
        ProtectHome = true;
        PrivateTmp = true;
        PrivateDevices = true;
        ProtectKernelTunables = true;
        ProtectKernelModules = true;
        ProtectControlGroups = true;
        RestrictSUIDSGID = true;
        MemoryDenyWriteExecute = false;
      };
    };

    networking.firewall.allowedTCPPorts = lib.mkIf cfg.openFirewall [ cfg.port ];
  };
}
