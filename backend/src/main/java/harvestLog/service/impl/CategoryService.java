package harvestLog.service.impl;

import harvestLog.dto.CategoryRequest;
import harvestLog.dto.CategoryResponse;
import harvestLog.exception.AlreadyExistsException;
import harvestLog.model.Category;
import harvestLog.model.Farmer;
import harvestLog.repository.CategoryRepository;
import harvestLog.repository.FarmerRepository;
import harvestLog.service.ICategoryService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService implements ICategoryService {

    private final CategoryRepository repository;
    private final FarmerRepository farmerRepository;

    public CategoryService(CategoryRepository repository, FarmerRepository farmerRepository) {
        this.repository = repository;
        this.farmerRepository = farmerRepository;
    }

    @Override
    public List<CategoryResponse> getAllForFarmerId(Long farmerId) {
        return repository.findByFarmerId(farmerId, null).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getActiveForFarmerId(Long farmerId) {
        return repository.findByFarmerIdAndActive(farmerId, true).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getInactiveForFarmerId(Long farmerId) {
        return repository.findByFarmerIdAndActive(farmerId, false).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryResponse> getAllForFarmerId(Long farmerId, Boolean active) {
        if (active == null) {
            return getAllForFarmerId(farmerId);
        }
        return active ? getActiveForFarmerId(farmerId) : getInactiveForFarmerId(farmerId);
    }

    @Override
    public Optional<CategoryResponse> getById(Long id, Long farmerId) {
        return repository.findById(id)
                .filter(category -> category.getFarmer().getId().equals(farmerId))
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request, Long farmerId) {
        try {
            Category category = toEntity(request, farmerId);
            Category saved = repository.save(category);
            return toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            return handleDuplicateCategory(request, farmerId);
        }
    }

    private CategoryResponse handleDuplicateCategory(CategoryRequest request, Long farmerId) {
        Optional<Category> existing = repository.findByNameIgnoreCaseAndFarmerId(request.name().toUpperCase(), farmerId);

        if (existing.isPresent() && !existing.get().isActive()) {
            Category category = existing.get();
            category.setActive(true);
            return toResponse(repository.save(category));
        }

        throw new AlreadyExistsException("Active category with name '" + request.name() + "' already exists");
    }

    @Override
    @Transactional
    public List<CategoryResponse> createBatch(List<CategoryRequest> requests, Long farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found: " + farmerId));

        List<Category> categories = requests.stream()
                .map(request -> {
                    Category category = new Category();
                    category.setName(request.name().toUpperCase());
                    category.setFarmer(farmer);
                    category.setActive(request.active() != null ? request.active() : true);
                    return category;
                })
                .collect(Collectors.toList());

        List<Category> saved = repository.saveAll(categories);
        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Optional<CategoryResponse> update(Long id, CategoryRequest request, Long farmerId) {
        return repository.findById(id)
                .filter(category -> category.getFarmer().getId().equals(farmerId))
                .map(category -> {
                    if (request.name() != null) {
                        category.setName(request.name().toUpperCase());
                    }
                    if (request.active() != null) {
                        category.setActive(request.active());
                    }
                    return toResponse(repository.save(category));
                });
    }

    @Override
    @Transactional
    public boolean delete(Long id, Long farmerId) {
        return repository.softDeleteByIdInAndFarmerId(List.of(id), farmerId) > 0;
    }

    @Override
    @Transactional
    public int deleteBatch(List<Long> ids, Long farmerId) {
        if (ids == null || ids.isEmpty()) {
            return 0;
        }
        return repository.softDeleteByIdInAndFarmerId(ids, farmerId);
    }

    @Override
    @Transactional
    public Category getOrCreateActiveByName(String name, Long farmerId) {
        String normalized = name == null ? null : name.toUpperCase();
        if (normalized == null || normalized.isBlank()) {
            throw new IllegalArgumentException("Category name must not be empty");
        }

        Optional<Category> existing = repository.findByNameIgnoreCaseAndFarmerId(normalized, farmerId);
        if (existing.isPresent()) {
            Category cat = existing.get();
            if (!cat.isActive()) {
                cat.setActive(true);
                cat = repository.save(cat);
            }
            return cat;
        }

        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found: " + farmerId));

        Category newCategory = new Category();
        newCategory.setName(normalized);
        newCategory.setFarmer(farmer);
        newCategory.setActive(true);

        return repository.save(newCategory);
    }

    private Category toEntity(CategoryRequest request, Long farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new IllegalArgumentException("Farmer not found: " + farmerId));

        Category category = new Category();
        category.setName(request.name().toUpperCase());
        category.setFarmer(farmer);
        category.setActive(request.active() != null ? request.active() : true);
        return category;
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.isActive()
        );
    }
}
