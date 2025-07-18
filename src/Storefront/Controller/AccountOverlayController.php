<?php declare(strict_types=1);

namespace Smoxy\Storefront\Controller;

use Shopware\Core\System\SalesChannel\SalesChannelContext;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Shopware\Storefront\Controller\StorefrontController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * SMOXY Account Overlay Controller
 * 
 * Provides AJAX endpoints for account overlay content based on customer login status.
 * Returns JSON responses with appropriate URLs and user information for dynamic rendering.
 * 
 * @package Smoxy\Storefront\Controller
 * @author Dennis Heidtmann <dennis.heidtmann@gmail.com>
 * @version 1.0.0
 */
class AccountOverlayController extends StorefrontController
{
    private SystemConfigService $systemConfigService;

    public function __construct(SystemConfigService $systemConfigService)
    {
        $this->systemConfigService = $systemConfigService;
    }

    /**
     * Account overlay AJAX endpoint
     * 
     * Returns JSON response with account menu structure based on customer login status.
     * Includes appropriate navigation links and user information.
     * 
     * @param Request $request HTTP request object
     * @param SalesChannelContext $context Current sales channel context
     * @return JsonResponse JSON response with account data
     */
    public function overlay(Request $request, SalesChannelContext $context): JsonResponse
    {
        $customer = $context->getCustomer();
        
        if ($customer && !$customer->getGuest()) {
            // Logged in user - provide full account navigation
            $data = [
                'isLoggedIn' => true,
                'customerName' => $customer->getFirstName() . ' ' . $customer->getLastName(),
                'customerEmail' => $customer->getEmail(),
                'links' => [
                    'overview' => $this->generateUrl('frontend.account.home.page'),
                    'profile' => $this->generateUrl('frontend.account.profile.page'),
                    'addresses' => $this->generateUrl('frontend.account.address.page'),
                    'orders' => $this->generateUrl('frontend.account.order.page'),
                    'logout' => $this->generateUrl('frontend.account.logout.page')
                ]
            ];
        } else {
            // Guest user - provide login/register links
            $data = [
                'isLoggedIn' => false,
                'links' => [
                    'login' => $this->generateUrl('frontend.account.login.page'),
                    'register' => $this->generateUrl('frontend.account.login.page')
                ]
            ];
        }
        
        // Get cache settings from plugin configuration
        $salesChannelId = $context->getSalesChannelId();
        $enableCaching = $this->systemConfigService->getBool('Smoxy.config.enableCaching', $salesChannelId);
        $cacheTimeout = $this->systemConfigService->getInt('Smoxy.config.cacheTimeout', $salesChannelId);
        
        // Add plugin configuration to response
        $data['config'] = [
            'enableCaching' => $enableCaching,
            'cacheTimeout' => $cacheTimeout * 1000, // Convert to milliseconds for JavaScript
            'loadOnHover' => $this->systemConfigService->getBool('Smoxy.config.loadOnHover', $salesChannelId),
            'loadOnClick' => $this->systemConfigService->getBool('Smoxy.config.loadOnClick', $salesChannelId),
        ];
        
        $response = new JsonResponse($data);
        $response->setPrivate();
        
        // Apply cache settings from configuration
        if ($enableCaching && $cacheTimeout > 0) {
            $response->setMaxAge($cacheTimeout);
        } else {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        
        return $response;
    }

    /**
     * Config endpoint for JavaScript plugin
     * 
     * Returns only the plugin configuration for JavaScript initialization.
     * 
     * @param Request $request HTTP request object
     * @param SalesChannelContext $context Current sales channel context
     * @return JsonResponse JSON response with plugin configuration
     */
    public function config(Request $request, SalesChannelContext $context): JsonResponse
    {
        $salesChannelId = $context->getSalesChannelId();
        
        $config = [
            'enableCaching' => $this->systemConfigService->getBool('Smoxy.config.enableCaching', $salesChannelId),
            'cacheTimeout' => $this->systemConfigService->getInt('Smoxy.config.cacheTimeout', $salesChannelId) * 1000, // Convert to milliseconds
            'loadOnHover' => $this->systemConfigService->getBool('Smoxy.config.loadOnHover', $salesChannelId),
            'loadOnClick' => $this->systemConfigService->getBool('Smoxy.config.loadOnClick', $salesChannelId),
        ];
        
        $response = new JsonResponse($config);
        $response->setPrivate();
        $response->setMaxAge(60); // Cache config for 1 minute
        
        return $response;
    }
}